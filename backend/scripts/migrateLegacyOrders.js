/**
 * Replaces the legacy grouped `orders.json` with per-restaurant order records
 * and matching transaction records, so the dashboard and the multi-restaurant
 * tracking screen have realistic data to render.
 *
 *   node scripts/migrateLegacyOrders.js
 */
const path = require('path');
const fs = require('fs').promises;
const { buildSplit } = require('../src/utils/stripeUtils');
const { DEFAULT_CUSTOMER_ADDRESS, DRIVER_START, STATUS } = require('../src/utils/deliverySimulator');

const DATA_DIR = path.join(__dirname, '..', 'data');
const readJson = async (file) => JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf8'));
const writeJson = async (file, payload) =>
  fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(payload, null, 2), 'utf8');

const MINUTE = 60 * 1000;

/**
 * @param {object} spec
 * @param {number} spec.startsAgoMinutes simulated minutes since the order was placed
 */
const buildTransaction = (spec, restaurants) => {
  const { transactionId, customerId, customerName, startsAgoMinutes, groups, timeScale = 1, prepOverrides = {} } = spec;

  const payableGroups = groups.map((group) => {
    const restaurant = restaurants.find((item) => item.id === group.restaurantId);
    return {
      ...group,
      commissionRate: restaurant?.commission_rate ?? 0.12,
      stripeAccountId: restaurant?.stripe_account_id ?? null,
    };
  });

  const deliveryFee = payableGroups.length * 40;
  const discount = spec.discount ?? 0;
  const { splits } = buildSplit({ groups: payableGroups, deliveryFee, discount });

  const placedAt = new Date(Date.now() - startsAgoMinutes * MINUTE / timeScale).toISOString();
  const simulationStartedAt = placedAt;

  const orders = payableGroups.map((group) => {
    const split = splits.find((item) => item.restaurantId === group.restaurantId);
    const restaurant = restaurants.find((item) => item.id === group.restaurantId);
    return {
      orderId: `${transactionId}-${group.restaurantId}`,
      transactionId,
      customerId,
      customerName,
      restaurantId: group.restaurantId,
      restaurantName: group.restaurantName,
      coordinates: restaurant?.coordinates ?? null,
      items: group.items,
      subtotal: group.subtotal,
      discountShare: split.discountShare,
      deliveryFeeShare: split.deliveryFeeShare,
      commissionRate: split.commissionRate,
      commissionAmount: split.commissionAmount,
      payoutAmount: split.transferAmount,
      transferId: `tr_sim_${transactionId}_${group.restaurantId}`,
      paymentIntentId: `pi_sim_${transactionId}`,
      status: STATUS.PLACED,
      prepMinutes: prepOverrides[group.restaurantId] ?? restaurant?.default_prep_minutes ?? 18,
      defaultPrepMinutes: restaurant?.default_prep_minutes ?? 18,
      // Already-answered orders so the seeded history is not stuck awaiting
      // confirmation.
      acceptedAt: new Date(new Date(placedAt).getTime() + 2 * MINUTE).toISOString(),
      declinedAt: null,
      placedAt,
      date: placedAt.slice(0, 10),
    };
  });

  return {
    orders,
    transaction: {
      transactionId,
      customerId,
      customerName,
      customerAddress: spec.customerAddress ?? DEFAULT_CUSTOMER_ADDRESS,
      placedAt,
      simulationStartedAt,
      timeScale,
      orderIds: orders.map((order) => order.orderId),
      payment: {
        paymentIntentId: `pi_sim_${transactionId}`,
        transferGroup: `ORDER_${transactionId}`,
        mode: 'simulated',
        status: 'succeeded',
        currency: 'inr',
        chargedAmount: splits.reduce((sum, s) => sum + s.netFoodAmount, 0) + deliveryFee,
        subtotal: payableGroups.reduce((sum, g) => sum + g.subtotal, 0),
        deliveryFee,
        discount,
        platformTotal: splits.reduce((sum, s) => sum + s.platformRevenue, 0),
        reconciled: true,
        splits: splits.map((split) => ({ ...split, transferId: `tr_sim_${transactionId}_${split.restaurantId}`, transferStatus: 'paid' })),
        transfers: splits.map((split) => ({
          transferId: `tr_sim_${transactionId}_${split.restaurantId}`,
          restaurantId: split.restaurantId,
          stripeAccountId: split.stripeAccountId,
          amount: split.transferAmount,
          amountMinor: Math.round(split.transferAmount * 100),
        })),
      },
    },
  };
};

const main = async () => {
  const restaurants = await readJson('restaurants.json');
  const item = (dishId, name, price, quantity) => ({ dishId, name, price, quantity, lineTotal: price * quantity });

  const specs = [
    {
      transactionId: 'txn-seed-delivered',
      customerId: 'u1',
      customerName: 'Aarav Sharma',
      startsAgoMinutes: 90,
      groups: [
        {
          restaurantId: 'rest1',
          restaurantName: 'Mehfil Grand',
          items: [item('d1', 'Butter Chicken Masala', 349, 1)],
          subtotal: 349,
        },
        {
          restaurantId: 'rest5',
          restaurantName: 'Pizzeria Roma',
          items: [item('d5', 'Margherita Pizza', 299, 2)],
          subtotal: 598,
        },
      ],
    },
    {
      transactionId: 'txn-seed-in-transit',
      customerId: 'u1',
      customerName: 'Aarav Sharma',
      startsAgoMinutes: 9,
      groups: [
        {
          restaurantId: 'rest2',
          restaurantName: 'Kathi Zone',
          items: [item('d2', 'Paneer Tikka Roll', 189, 2), item('d8', 'Crispy French Fries', 129, 1)],
          subtotal: 507,
        },
        {
          restaurantId: 'rest7',
          restaurantName: 'Burger Club',
          items: [item('d7', 'Double Cheese Burger', 249, 1)],
          subtotal: 249,
        },
      ],
      prepOverrides: { rest2: 14, rest7: 10 },
    },
    {
      transactionId: 'txn-seed-fresh',
      customerId: 'u1',
      customerName: 'Aarav Sharma',
      startsAgoMinutes: 0.4,
      groups: [
        {
          restaurantId: 'rest3',
          restaurantName: 'Noodle Bar',
          items: [item('d3', 'Szechuan Noodles', 229, 1)],
          subtotal: 229,
        },
        {
          restaurantId: 'rest8',
          restaurantName: 'Dessert Heaven',
          items: [item('d9', 'Chocolate Lava Cake', 159, 1)],
          subtotal: 159,
        },
      ],
    },
  ];

  const built = specs.map((spec) => buildTransaction(spec, restaurants));
  const orders = built.flatMap((entry) => entry.orders);
  const transactions = built.map((entry) => entry.transaction);

  await writeJson('orders.json', orders);
  await writeJson('transactions.json', transactions);

  console.log(`Migrated ${orders.length} per-restaurant orders across ${transactions.length} transactions.`);
  console.log(`Driver start: ${DRIVER_START.name}`);
};

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
