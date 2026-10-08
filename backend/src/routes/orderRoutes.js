const express = require('express');
const Order = require('../models/Order');
const { optionalCustomer } = require('../middleware/requireCustomer');
const {
  getOrderById,
  getLiveTransaction,
  listLiveTransactions,
  placeOrder,
} = require('../services/orderService');
const { toPlainList } = require('../utils/serialize');

const router = express.Router();

/**
 * GET /api/orders
 * With a bearer token the result is always restricted to that customer, so one
 * customer can never list another's orders. Without a token the legacy
 * customerId / restaurantId / transactionId filters still apply.
 */
router.get('/orders', optionalCustomer, async (req, res, next) => {
  try {
    const { restaurantId, transactionId } = req.query;
    const customerId = req.customer ? req.customer.id : req.query.customerId;

    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (restaurantId) filter.restaurantId = restaurantId;
    if (transactionId) filter.transactionId = transactionId;

    const orders = await Order.find(filter).sort({ placedAt: -1 }).lean();
    res.status(200).json({ orders: toPlainList(orders) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/transactions
 * Live, simulated view of each checkout (one entry per customer payment).
 * This is what the customer tracking screen polls.
 */
router.get('/orders/transactions', optionalCustomer, async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const customerId = req.customer ? req.customer.id : req.query.customerId;
    const transactions = await listLiveTransactions({ customerId, restaurantId });
    res.status(200).json({ transactions });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/track/:transactionId
 * Polled by the customer to watch every restaurant order advance on its own.
 */
router.get('/orders/track/:transactionId', async (req, res, next) => {
  try {
    const transaction = await getLiveTransaction(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ error: `Transaction ${req.params.transactionId} not found.` });
    }
    res.status(200).json({ transaction });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:orderId
 * A single per-restaurant order record. A signed-in customer may only read
 * their own order.
 */
router.get('/orders/:orderId', optionalCustomer, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: `Order ${req.params.orderId} not found.` });
    }
    if (req.customer && order.customerId !== req.customer.id) {
      return res.status(404).json({ error: `Order ${req.params.orderId} not found.` });
    }

    const live = await getLiveTransaction(order.transactionId);
    const simulated = live?.orders?.find((item) => item.orderId === order.orderId) ?? null;
    res.status(200).json({ order: { ...order, ...(simulated ?? {}) } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/orders
 * Charges the customer once and creates the per-restaurant orders, then starts
 * the multi-stop delivery simulation. Equivalent to POST /api/payments/checkout.
 * Identity comes from the bearer token whenever one is supplied.
 */
router.post('/orders', optionalCustomer, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body?.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: 'An order must contain at least one item.' });
    }

    const { transaction, orders, payment } = await placeOrder({
      items: req.body.items,
      customerId: req.customer ? req.customer.id : req.body.customerId,
      customerName: req.customer ? req.customer.name : req.body.customerName,
      customerAddress: req.customer
        ? req.body.customerAddress ?? defaultAddress(req.customer)
        : req.body.customerAddress,
      deliveryFee: req.body.deliveryFee,
      discount: req.body.discount,
      timeScale: req.body.timeScale,
    });

    res.status(201).json({
      // Aggregate view kept for the legacy single-order response shape.
      order: {
        id: transaction.transactionId,
        transactionId: transaction.transactionId,
        customerId: transaction.customerId,
        status: transaction.payment.status,
        total: transaction.payment.chargedAmount,
        subtotal: transaction.payment.subtotal,
        deliveryFee: transaction.payment.deliveryFee,
        discount: transaction.payment.discount,
        groups: orders.map((order) => ({
          orderId: order.orderId,
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          items: order.items,
          subtotal: order.subtotal,
          payoutAmount: order.payoutAmount,
        })),
        date: transaction.placedAt.slice(0, 10),
      },
      orders,
      payment,
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

/** Prefers the customer's saved default address when they did not send one. */
function defaultAddress(customer) {
  const chosen = (customer.addresses || []).find((address) => address.isDefault)
    || (customer.addresses || [])[0];

  if (chosen) {
    return { label: chosen.label, line1: chosen.line1, city: chosen.city, pincode: chosen.pincode };
  }
  return customer.address ? { label: 'Home', line1: customer.address, city: '', pincode: '' } : undefined;
}

module.exports = router;
