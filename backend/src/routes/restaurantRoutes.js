const express = require('express');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');
const { auth } = require('./authRoutes');
const {
  getOrdersForRestaurant,
  updateOrderFromRestaurant,
  getRestaurantStats,
  attachLiveState,
  listLiveTransactions,
} = require('../services/orderService');
const { STATUS } = require('../utils/deliverySimulator');
const { toOwnerRestaurant } = require('../utils/authUtils');
const { toPlain, toPlainList } = require('../utils/serialize');

const router = express.Router();

// Scoped to this router's own paths: the guard must not swallow public routes
// that are mounted on the same /api prefix.
router.use('/restaurant', auth);

/**
 * GET /api/restaurant/orders
 * Incoming orders for the signed-in restaurant, newest first.
 */
router.get('/restaurant/orders', async (req, res, next) => {
  try {
    const withLiveStatus = await attachLiveState(await getOrdersForRestaurant(req.restaurant.id));
    const status = String(req.query.status ?? '');

    const filtered = status
      ? withLiveStatus.filter((order) => order.status === status || order.liveStatus === status)
      : withLiveStatus;

    res.status(200).json({
      orders: filtered,
      counts: {
        total: withLiveStatus.length,
        new: withLiveStatus.filter((order) => !order.acceptedAt && !order.declinedAt).length,
        preparing: withLiveStatus.filter((order) => order.status === STATUS.ACCEPTED).length,
        delivered: withLiveStatus.filter((order) => order.status === STATUS.DELIVERED).length,
        declined: withLiveStatus.filter((order) => order.status === STATUS.DECLINED).length,
      },
      statuses: Object.values(STATUS),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/restaurant/orders/:orderId
 * Accept / decline an order and optionally declare a preparation time.
 */
router.patch('/restaurant/orders/:orderId', async (req, res, next) => {
  try {
    const { status, prepMinutes, reason } = req.body ?? {};
    if (status && !Object.values(STATUS).includes(status) && status !== 'Declined') {
      return res.status(400).json({ error: 'Unsupported order status.' });
    }
    if (prepMinutes !== undefined && Number(prepMinutes) <= 0) {
      return res.status(400).json({ error: 'prepMinutes must be greater than zero.' });
    }

    const order = await updateOrderFromRestaurant({
      orderId: req.params.orderId,
      restaurantId: req.restaurant.id,
      status: status ?? STATUS.ACCEPTED,
      prepMinutes,
      reason,
    });

    res.status(200).json({ order: (await attachLiveState([order]))[0] });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

/**
 * GET /api/restaurant/stats
 * Revenue, commission and payout summary for the dashboard header.
 */
router.get('/restaurant/stats', async (req, res, next) => {
  try {
    const stats = await getRestaurantStats(req.restaurant.id);
    res.status(200).json({ stats, restaurant: toOwnerRestaurant(req.restaurant) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restaurant/menu
 * The restaurant's own dishes, for the dashboard menu tab.
 */
router.get('/restaurant/menu', async (req, res, next) => {
  try {
    const dishes = await Dish.find({ restaurantId: req.restaurant.id }).lean();
    res.status(200).json({
      dishes: toPlainList(dishes),
      restaurant: toOwnerRestaurant(req.restaurant),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/restaurant/settings
 * Update the default preparation time and open/closed state.
 */
router.patch('/restaurant/settings', async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ id: req.restaurant.id });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }

    const { defaultPrepMinutes, isOpen, commission_rate: commissionRate } = req.body ?? {};
    if (defaultPrepMinutes !== undefined) {
      const minutes = Number(defaultPrepMinutes);
      if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 240) {
        return res.status(400).json({ error: 'defaultPrepMinutes must be between 1 and 240.' });
      }
      restaurant.default_prep_minutes = Math.round(minutes);
    }
    if (isOpen !== undefined) {
      restaurant.is_open = Boolean(isOpen);
    }
    if (commissionRate !== undefined) {
      const rate = Number(commissionRate);
      if (!Number.isFinite(rate) || rate < 0 || rate > 0.5) {
        return res.status(400).json({ error: 'commission_rate must be between 0 and 0.5.' });
      }
      restaurant.commission_rate = rate;
    }

    await restaurant.save();
    res.status(200).json({ restaurant: toOwnerRestaurant(toPlain(restaurant)) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restaurant/deliveries
 * The restaurant's view of the live deliveries it is part of.
 */
router.get('/restaurant/deliveries', async (req, res, next) => {
  try {
    const transactions = await listLiveTransactions({ restaurantId: req.restaurant.id });
    res.status(200).json({ deliveries: transactions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
