const express = require('express');
const Cart = require('../models/Cart');
const Dish = require('../models/Dish');
const { requireCustomer, verifyCustomerToken } = require('../middleware/requireCustomer');
const { extractBearerToken } = require('../utils/authUtils');
const { calculateBestCoupon } = require('../utils/couponUtils');
const { toPlain } = require('../utils/serialize');

const router = express.Router();

const DELIVERY_FEE_PER_RESTAURANT = 40;

const emptyCart = (customerId) => ({
  customerId,
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  deliveryFeePerRestaurant: DELIVERY_FEE_PER_RESTAURANT,
  total: 0,
  discount: 0,
  finalTotal: 0,
  appliedCoupon: null,
});

const rebuildTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const restaurantIds = [...new Set(items.map((item) => item.restaurantId || 'unknown'))];
  const deliveryFee = restaurantIds.length * DELIVERY_FEE_PER_RESTAURANT;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
};

/** Recomputes totals and re-picks the best coupon, exactly as before. */
const settleCart = (cart) => {
  const totals = rebuildTotals(cart.items);
  cart.subtotal = totals.subtotal;
  cart.deliveryFee = totals.deliveryFee;
  cart.deliveryFeePerRestaurant = DELIVERY_FEE_PER_RESTAURANT;
  cart.total = totals.total;

  const { bestCoupon, discount } = calculateBestCoupon(cart.items, cart.subtotal, cart.deliveryFee);
  cart.appliedCoupon = bestCoupon
    ? { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description }
    : null;
  cart.discount = discount;
  cart.finalTotal = cart.total - discount;
  return cart;
};

const loadCart = async (customerId) => {
  const existing = await Cart.findOne({ customerId }).lean();
  return existing ? toPlain(existing) : emptyCart(customerId);
};

const saveCart = async (cart) => {
  const saved = await Cart.findOneAndUpdate(
    { customerId: cart.customerId },
    { $set: cart },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return toPlain(saved);
};

/**
 * Registered before the guard below: `apply-coupon` may be called with a
 * caller-supplied item list and never touches the stored cart, so it stays
 * public. The guard is a prefix match and would otherwise reject it first.
 */
router.post('/cart/apply-coupon', async (req, res, next) => {
  try {
    const body = req.body || {};
    let items = body.items;
    let subtotal = Number(body.subtotal) || 0;
    let deliveryFee = Number(body.deliveryFee) || 0;
    let cart = null;

    // When the caller is signed in and sends no item list we quote against
    // their stored cart and persist the coupon that was picked.
    if (!items && req.headers.authorization) {
      const token = extractBearerToken(req);
      const claims = token ? verifyCustomerToken(token) : null;
      if (claims) {
        cart = await loadCart(claims.sub);
        items = cart.items;
        subtotal = cart.subtotal;
        deliveryFee = cart.deliveryFee;
      }
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array.' });
    }

    const { bestCoupon, discount } = calculateBestCoupon(items, subtotal, deliveryFee);

    if (bestCoupon && cart) {
      cart.appliedCoupon = {
        id: bestCoupon.id,
        code: bestCoupon.code,
        description: bestCoupon.description,
      };
      cart.discount = discount;
      cart.finalTotal = cart.total - discount;
      await saveCart(cart);
    }

    res.status(200).json({
      coupon: bestCoupon
        ? { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description }
        : null,
      discount,
      finalTotal: subtotal + deliveryFee - discount,
    });
  } catch (error) {
    next(error);
  }
});

/** Carts are per customer now, so every other cart route needs the token. */
router.use('/cart', requireCustomer);

router.get('/cart', async (req, res, next) => {
  try {
    const cart = await loadCart(req.customer.id);
    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
});

router.post('/cart', async (req, res, next) => {
  try {
    const body = req.body || {};
    const dishId = body.dishId;
    if (!dishId) {
      return res.status(400).json({ error: 'dishId is required.' });
    }

    const dish = await Dish.findOne({ id: dishId }).lean();
    if (!dish) {
      return res.status(404).json({ error: `Dish ${dishId} not found.` });
    }

    const cart = await loadCart(req.customer.id);
    const quantity = Number(body.quantity) || 1;
    const existing = cart.items.find((item) => item.dishId === dishId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        dishId: dish.id,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
        name: dish.name,
        quantity,
        price: dish.price,
      });
    }

    const saved = await saveCart(settleCart(cart));
    res.status(201).json({ cart: saved });
  } catch (error) {
    next(error);
  }
});

router.put('/cart', async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items) {
      return res.status(400).json({ error: 'items array is required.' });
    }

    const cart = await loadCart(req.customer.id);
    cart.items = items.map((item) => ({
      dishId: item.dishId,
      restaurantId: item.restaurantId || 'unknown',
      restaurantName: item.restaurantName || item.name || '',
      name: item.name || '',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    }));

    const saved = await saveCart(settleCart(cart));
    res.status(200).json({ cart: saved });
  } catch (error) {
    next(error);
  }
});

router.delete('/cart/:dishId', async (req, res, next) => {
  try {
    const cart = await loadCart(req.customer.id);
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => item.dishId !== req.params.dishId);

    if (cart.items.length === before) {
      return res.status(404).json({ error: `Dish ${req.params.dishId} not in cart.` });
    }

    const saved = await saveCart(settleCart(cart));
    res.status(200).json({ cart: saved });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
