/**
 * Order service.
 *
 * A single customer checkout is charged once and then split into one order
 * record per restaurant. All of those records share a `transactionId`, so the
 * customer sees one order with N cards and each restaurant only ever sees (and
 * can only ever act on) its own order.
 *
 * Persistence is MongoDB: one `Order` document per restaurant and one
 * `Transaction` document per customer payment.
 */

const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Restaurant = require('../models/Restaurant');
const { chargeAndSplit, refundTransfer } = require('../utils/stripeUtils');
const { simulateTransaction, applyOrderDecision, STATUS, DEFAULT_CUSTOMER_ADDRESS } = require('../utils/deliverySimulator');
const { toPlain } = require('../utils/serialize');

const DELIVERY_FEE_PER_RESTAURANT = 40;

const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const groupItemsByRestaurant = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const restaurantId = item.restaurantId || 'unknown';
    if (!map.has(restaurantId)) {
      map.set(restaurantId, {
        restaurantId,
        restaurantName: item.restaurantName || item.name || 'Unknown restaurant',
        items: [],
        subtotal: 0,
      });
    }
    const group = map.get(restaurantId);
    const quantity = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    group.items.push({
      dishId: item.dishId,
      name: item.name,
      quantity,
      price,
      lineTotal: price * quantity,
    });
    group.subtotal += price * quantity;
  });
  return [...map.values()];
};

/**
 * Charges the customer once, then persists the per-restaurant orders and the
 * transaction that links them together.
 */
const placeOrder = async ({
  items,
  customerId = 'u1',
  customerName = 'Guest',
  customerAddress,
  deliveryFee,
  discount = 0,
  timeScale,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error('An order must contain at least one item.');
    error.status = 400;
    throw error;
  }

  const restaurants = await Restaurant.find().lean();
  const groups = groupItemsByRestaurant(items);
  const fee = Number.isFinite(deliveryFee)
    ? Number(deliveryFee)
    : groups.length * DELIVERY_FEE_PER_RESTAURANT;

  // Enrich each group with the payout data the payment service needs.
  const payableGroups = groups.map((group) => {
    const restaurant = restaurants.find((item) => item.id === group.restaurantId);
    return {
      ...group,
      commissionRate: restaurant?.commission_rate ?? 0.12,
      stripeAccountId: restaurant?.stripe_account_id ?? null,
      coordinates: restaurant?.coordinates ?? null,
    };
  });

  const transactionId = makeId('txn');
  const payment = await chargeAndSplit({
    groups: payableGroups,
    deliveryFee: fee,
    discount,
    customerId,
    orderReference: transactionId,
  });

  const placedAt = new Date().toISOString();
  const scale = Number(timeScale) > 0 ? Number(timeScale) : Number(process.env.DELIVERY_TIME_SCALE) || 1;

  const orders = payableGroups.map((group) => {
    const split = payment.splits.find((item) => item.restaurantId === group.restaurantId);
    const restaurant = restaurants.find((item) => item.id === group.restaurantId);
    return {
      orderId: makeId('ord'),
      transactionId,
      customerId,
      customerName,
      customerAddress: customerAddress ?? null,
      restaurantId: group.restaurantId,
      restaurantName: group.restaurantName,
      coordinates: group.coordinates,
      items: group.items,
      subtotal: group.subtotal,
      discountShare: split?.discountShare ?? 0,
      deliveryFeeShare: split?.deliveryFeeShare ?? 0,
      commissionRate: split?.commissionRate ?? 0.12,
      commissionAmount: split?.commissionAmount ?? 0,
      payoutAmount: split?.transferAmount ?? 0,
      transferId: split?.transferId ?? null,
      paymentIntentId: payment.paymentIntentId,
      payment: {
        status: payment.status,
        chargedAmount: payment.totals.chargedAmount,
      },
      status: STATUS.PLACED,
      prepMinutes: restaurant?.default_prep_minutes ?? 18,
      defaultPrepMinutes: restaurant?.default_prep_minutes ?? 18,
      acceptedAt: null,
      declinedAt: null,
      placedAt,
      date: placedAt.slice(0, 10),
    };
  });

  const transaction = {
    transactionId,
    customerId,
    customerName,
    customerAddress: customerAddress ?? DEFAULT_CUSTOMER_ADDRESS,
    placedAt,
    simulationStartedAt: placedAt,
    timeScale: scale,
    orderIds: orders.map((order) => order.orderId),
    payment: {
      paymentIntentId: payment.paymentIntentId,
      transferGroup: payment.transferGroup,
      mode: payment.mode,
      status: payment.status,
      currency: payment.currency,
      chargedAmount: payment.totals.chargedAmount,
      subtotal: payment.totals.subtotal,
      deliveryFee: payment.totals.deliveryFee,
      discount: payment.totals.discount,
      platformTotal: payment.totals.platformTotal,
      reconciled: payment.totals.reconciled,
      splits: payment.splits,
      transfers: payment.transfers,
      reversals: [],
    },
  };

  await Promise.all([Order.insertMany(orders), Transaction.create(transaction)]);

  return { transaction, orders, payment };
};

const getOrdersForRestaurant = async (restaurantId) => {
  const orders = await Order.find({ restaurantId }).sort({ placedAt: -1 }).lean();
  return orders.map(toPlain);
};

/**
 * Attaches the simulated live status to each order.
 *
 * The delivery state machine is derived from wall-clock time on every read, so
 * the persisted `status` field only ever records restaurant decisions
 * (accepted / declined). Anything reporting progress, counts or revenue has to
 * go through here or it will show stale "Placed" orders.
 */
const attachLiveState = async (orders) => {
  if (orders.length === 0) return [];
  const transactionIds = [...new Set(orders.map((order) => order.transactionId))];

  const [transactions, siblings] = await Promise.all([
    Transaction.find({ transactionId: { $in: transactionIds } }).lean(),
    Order.find({ transactionId: { $in: transactionIds } }).lean(),
  ]);

  const liveByOrderId = new Map();
  transactions.forEach((transaction) => {
    const transactionOrders = siblings.filter((order) =>
      (transaction.orderIds || []).includes(order.orderId)
    );
    simulateTransaction({ ...transaction, orders: transactionOrders }).orders.forEach((state) => {
      liveByOrderId.set(state.orderId, state);
    });
  });

  return orders.map((order) => ({ ...order, ...(liveByOrderId.get(order.orderId) ?? {}) }));
};

const getOrdersForCustomer = async (customerId) => {
  const orders = await Order.find({ customerId }).sort({ placedAt: -1 }).lean();
  return orders.map(toPlain);
};

const getOrderById = async (orderId) => {
  const order = await Order.findOne({ orderId }).lean();
  return order ? toPlain(order) : null;
};

const getTransaction = async (transactionId) => {
  const transaction = await Transaction.findOne({ transactionId }).lean();
  return transaction ? toPlain(transaction) : null;
};

/**
 * Hydrates a transaction with its orders and runs the delivery simulation.
 */
const getLiveTransaction = async (transactionId) => {
  const transaction = await getTransaction(transactionId);
  if (!transaction) return null;

  const orders = await Order.find({ transactionId }).lean();
  const view = simulateTransaction({ ...transaction, orders });
  return { ...view, payment: transaction.payment };
};

const listLiveTransactions = async ({ customerId, restaurantId } = {}) => {
  const filter = {};
  if (customerId) filter.customerId = customerId;

  let transactions = await Transaction.find(filter).sort({ placedAt: -1 }).lean();

  if (restaurantId) {
    const owned = await Order.find({ restaurantId }).distinct('transactionId');
    const ownedSet = new Set(owned);
    transactions = transactions.filter((transaction) => ownedSet.has(transaction.transactionId));
  }

  const allOrderIds = transactions.flatMap((transaction) => transaction.orderIds || []);
  const orders = allOrderIds.length
    ? await Order.find({ orderId: { $in: allOrderIds } }).lean()
    : [];
  const ordersById = new Map(orders.map((order) => [order.orderId, order]));

  return transactions.map((transaction) => {
    const transactionOrders = (transaction.orderIds || [])
      .map((orderId) => ordersById.get(orderId))
      .filter(Boolean);
    return simulateTransaction({ ...transaction, orders: transactionOrders });
  });
};

/**
 * Restaurant-side action: accept or decline one of its orders and optionally set
 * how long preparation will take. Declining reverses the transfer.
 */
const updateOrderFromRestaurant = async ({ orderId, restaurantId, status, prepMinutes, reason }) => {
  const order = await Order.findOne({ orderId, restaurantId }).lean();
  if (!order) {
    const error = new Error('Order not found for this restaurant.');
    error.status = 404;
    throw error;
  }

  const nextStatus = status === 'Declined' || status === STATUS.DECLINED ? STATUS.DECLINED : STATUS.ACCEPTED;

  if (order.status === STATUS.DECLINED && nextStatus === STATUS.ACCEPTED) {
    const error = new Error('A declined order cannot be accepted again.');
    error.status = 409;
    throw error;
  }

  // The delivery state machine only advances while an order is accepted, so an
  // order that has already reached the customer is read-only.
  const [liveOrder] = await attachLiveState([toPlain(order)]);
  if (liveOrder?.completed && nextStatus === STATUS.ACCEPTED) {
    const error = new Error('This order has already been delivered and cannot be changed.');
    error.status = 409;
    throw error;
  }

  const update = {};

  if (nextStatus === STATUS.DECLINED && order.status !== STATUS.DECLINED) {
    update.status = STATUS.DECLINED;
    update.declinedAt = new Date().toISOString();
    update.declineReason = reason || 'Restaurant is at capacity right now.';

    const transaction = await getTransaction(order.transactionId);
    if (transaction?.payment) {
      const reversal = await refundTransfer({
        paymentIntentId: transaction.payment.paymentIntentId,
        transfers: (transaction.payment.transfers || []).filter(
          (transfer) => transfer.restaurantId === restaurantId
        ),
        reason: update.declineReason,
      });
      update.refundId = reversal.refundId;
      update.refundedAmount = reversal.reversedAmount;

      await Transaction.updateOne(
        { transactionId: order.transactionId },
        {
          $push: {
            'payment.reversals': {
              restaurantId,
              ...reversal,
              at: new Date().toISOString(),
            },
          },
        }
      );
    }
  } else if (nextStatus === STATUS.ACCEPTED && order.status !== STATUS.ACCEPTED) {
    update.status = STATUS.ACCEPTED;
    update.acceptedAt = new Date().toISOString();
  }

  if (Number(prepMinutes) > 0) {
    update.prepMinutes = Number(prepMinutes);
  }

  const saved = await Order.findOneAndUpdate(
    { orderId, restaurantId },
    { $set: update },
    { new: true }
  ).lean();

  return toPlain(saved);
};

/**
 * Revenue summary for the restaurant dashboard.
 *
 * Revenue is attributed to the restaurant's own order record only, so a
 * multi-restaurant checkout never double counts another restaurant's food.
 */
const getRestaurantStats = async (restaurantId) => {
  const orders = await attachLiveState(await getOrdersForRestaurant(restaurantId));
  const isDelivered = (order) => order.status === STATUS.DELIVERED;
  const isDeclined = (order) => order.status === STATUS.DECLINED;

  const delivered = orders.filter(isDelivered);
  const active = orders.filter((order) => !isDelivered(order) && !isDeclined(order));
  const declined = orders.filter(isDeclined);
  const settled = orders.filter((order) => !isDeclined(order));

  const sum = (list, key) => list.reduce((total, item) => total + (Number(item[key]) || 0), 0);

  return {
    restaurantId,
    orderCount: orders.length,
    newOrderCount: active.filter((order) => !order.acceptedAt).length,
    inProgressCount: active.length,
    deliveredOrderCount: delivered.length,
    declinedOrderCount: declined.length,
    grossRevenue: sum(settled, 'subtotal'),
    deliveredRevenue: sum(delivered, 'subtotal'),
    // What the restaurant actually receives: food subtotal less its share of any
    // discount, minus the platform commission.
    netPayout: sum(settled, 'payoutAmount'),
    pendingPayout: sum(active, 'payoutAmount'),
    platformCommission: sum(settled, 'commissionAmount'),
    deliveryFeeShare: sum(settled, 'deliveryFeeShare'),
    refundedAmount: sum(declined, 'refundedAmount'),
    averageOrderValue: settled.length ? Math.round(sum(settled, 'subtotal') / settled.length) : 0,
  };
};

module.exports = {
  DELIVERY_FEE_PER_RESTAURANT,
  placeOrder,
  getOrdersForRestaurant,
  getOrdersForCustomer,
  getOrderById,
  getTransaction,
  getLiveTransaction,
  listLiveTransactions,
  updateOrderFromRestaurant,
  getRestaurantStats,
  groupItemsByRestaurant,
  attachLiveState,
  applyOrderDecision,
};
