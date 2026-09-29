const express = require('express');
const { readOrders } = require('../dataStore');
const {
  getOrderById,
  getLiveTransaction,
  listLiveTransactions,
  placeOrder,
} = require('../services/orderService');

const router = express.Router();

/**
 * GET /api/orders
 * Optional filters: customerId, restaurantId, transactionId.
 */
router.get('/orders', async (req, res, next) => {
  try {
    const { customerId, restaurantId, transactionId } = req.query;
    const orders = await readOrders();
    const filtered = orders.filter((order) => {
      if (customerId && order.customerId !== customerId) return false;
      if (restaurantId && order.restaurantId !== restaurantId) return false;
      if (transactionId && order.transactionId !== transactionId) return false;
      return true;
    });
    res.status(200).json({ orders: filtered });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/transactions
 * Live, simulated view of each checkout (one entry per customer payment).
 * This is what the customer tracking screen polls.
 */
router.get('/orders/transactions', async (req, res, next) => {
  try {
    const { customerId, restaurantId } = req.query;
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
 * A single per-restaurant order record.
 */
router.get('/orders/:orderId', async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order) {
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
 */
router.post('/orders', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body?.items) || req.body.items.length === 0) {
      return res.status(400).json({ error: 'An order must contain at least one item.' });
    }

    const { transaction, orders, payment } = await placeOrder({
      items: req.body.items,
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      customerAddress: req.body.customerAddress,
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

module.exports = router;
