const express = require('express');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const { buildSplit, isLive, CURRENCY, PLATFORM_FEE_PER_ORDER } = require('../utils/stripeUtils');
const { optionalCustomer } = require('../middleware/requireCustomer');
const { placeOrder, groupItemsByRestaurant, DELIVERY_FEE_PER_RESTAURANT } = require('../services/orderService');

const router = express.Router();

const buildPayableGroups = async (items) => {
  const restaurants = await Restaurant.find().lean();
  return groupItemsByRestaurant(items).map((group) => {
    const restaurant = restaurants.find((item) => item.id === group.restaurantId);
    return {
      ...group,
      commissionRate: restaurant?.commission_rate ?? 0.12,
      stripeAccountId: restaurant?.stripe_account_id ?? null,
    };
  });
};

/**
 * POST /api/payments/split-preview
 * Shows the customer exactly how one total is divided before they pay.
 */
router.post('/payments/split-preview', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'items must be a non-empty array.' });
    }

    const groups = await buildPayableGroups(items);
    const deliveryFee = Number.isFinite(req.body?.deliveryFee)
      ? Number(req.body.deliveryFee)
      : groups.length * DELIVERY_FEE_PER_RESTAURANT;
    const discount = Number(req.body?.discount) || 0;

    const preview = buildSplit({ groups, deliveryFee, discount });
    res.status(200).json({
      ...preview,
      currency: CURRENCY,
      platformHandlingFee: PLATFORM_FEE_PER_ORDER,
      paymentMode: isLive() ? 'live' : 'simulated',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/checkout
 * Charges the customer once, then creates one order per restaurant and starts
 * the multi-stop delivery simulation. Falls back to the signed-in customer's
 * stored cart when no item list is supplied.
 */
router.post('/payments/checkout', optionalCustomer, async (req, res, next) => {
  try {
    const stored = req.customer
      ? await Cart.findOne({ customerId: req.customer.id }).lean()
      : null;

    const items = Array.isArray(req.body?.items) && req.body.items.length
      ? req.body.items
      : stored?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'The cart is empty.' });
    }

    const deliveryFee = Number(req.body?.deliveryFee ?? stored?.deliveryFee) || 0;
    const discount = Number(req.body?.discount ?? stored?.discount) || 0;

    const { transaction, orders, payment } = await placeOrder({
      items,
      customerId: req.customer ? req.customer.id : req.body?.customerId ?? 'u1',
      customerName: req.customer ? req.customer.name : req.body?.customerName,
      customerAddress: req.body?.customerAddress,
      deliveryFee,
      discount,
      timeScale: req.body?.timeScale,
    });

    // Checkout completed: reset this customer's server side cart.
    if (req.customer && stored) {
      await Cart.updateOne(
        { customerId: req.customer.id },
        {
          $set: {
            items: [],
            subtotal: 0,
            deliveryFee: 0,
            total: 0,
            appliedCoupon: null,
            discount: 0,
            finalTotal: 0,
          },
        }
      );
    }

    res.status(201).json({
      transactionId: transaction.transactionId,
      // One order per restaurant, all sharing the single customer payment.
      orders: orders.map((order) => ({
        orderId: order.orderId,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        subtotal: order.subtotal,
        payoutAmount: order.payoutAmount,
        commissionAmount: order.commissionAmount,
        transferId: order.transferId,
        status: order.status,
        prepMinutes: order.prepMinutes,
        items: order.items,
      })),
      payment: {
        ...payment,
        paymentIntentId: transaction.payment.paymentIntentId,
        reconciled: transaction.payment.reconciled,
      },
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

module.exports = router;
