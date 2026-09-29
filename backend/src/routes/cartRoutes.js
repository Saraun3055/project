const express = require('express');
const { readCart, writeCart, readDishes } = require('../dataStore');
const { calculateBestCoupon } = require('../utils/couponUtils');

const router = express.Router();

const DELIVERY_FEE_PER_RESTAURANT = 40;

const rebuildTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const restaurantIds = [...new Set(items.map((item) => item.restaurantId || 'unknown'))];
  const deliveryFee = restaurantIds.length * DELIVERY_FEE_PER_RESTAURANT;
  const total = subtotal + deliveryFee;
  return { subtotal, deliveryFee, total };
};

router.get('/cart', async (req, res, next) => {
  try {
    const cart = await readCart();
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

    const dishes = await readDishes();
    const dish = dishes.find((item) => item.id === dishId);
    if (!dish) {
      return res.status(404).json({ error: `Dish ${dishId} not found.` });
    }

    const cart = await readCart();
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

    const totals = rebuildTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.deliveryFee = totals.deliveryFee;
    cart.deliveryFeePerRestaurant = DELIVERY_FEE_PER_RESTAURANT;
    cart.total = totals.total;

    const { bestCoupon, discount } = calculateBestCoupon(cart.items, cart.subtotal, cart.deliveryFee);
    cart.appliedCoupon = bestCoupon ? { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description } : null;
    cart.discount = discount;
    cart.finalTotal = cart.total - discount;

    await writeCart(cart);
    res.status(201).json({ cart });
  } catch (error) {
    next(error);
  }
});

router.put('/cart', async (req, res, next) => {
  try {
    const cart = await readCart();
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items) {
      return res.status(400).json({ error: 'items array is required.' });
    }

    cart.items = items.map((item) => ({
      dishId: item.dishId,
      restaurantId: item.restaurantId || 'unknown',
      restaurantName: item.restaurantName || item.name || '',
      name: item.name || '',
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
    }));

    const totals = rebuildTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.deliveryFee = totals.deliveryFee;
    cart.deliveryFeePerRestaurant = DELIVERY_FEE_PER_RESTAURANT;
    cart.total = totals.total;

    const { bestCoupon, discount } = calculateBestCoupon(cart.items, cart.subtotal, cart.deliveryFee);
    cart.appliedCoupon = bestCoupon ? { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description } : null;
    cart.discount = discount;
    cart.finalTotal = cart.total - discount;

    await writeCart(cart);
    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
});

router.delete('/cart/:dishId', async (req, res, next) => {
  try {
    const cart = await readCart();
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => item.dishId !== req.params.dishId);

    if (cart.items.length === before) {
      return res.status(404).json({ error: `Dish ${req.params.dishId} not in cart.` });
    }

    const totals = rebuildTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.deliveryFee = totals.deliveryFee;
    cart.deliveryFeePerRestaurant = DELIVERY_FEE_PER_RESTAURANT;
    cart.total = totals.total;

    const { bestCoupon, discount } = calculateBestCoupon(cart.items, cart.subtotal, cart.deliveryFee);
    cart.appliedCoupon = bestCoupon ? { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description } : null;
    cart.discount = discount;
    cart.finalTotal = cart.total - discount;

    await writeCart(cart);
    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
});

router.post('/cart/apply-coupon', async (req, res, next) => {
  try {
    const body = req.body || {};
    let items = body.items;
    let subtotal = Number(body.subtotal) || 0;
    let deliveryFee = Number(body.deliveryFee) || 0;

    if (!items) {
      const cart = await readCart();
      items = cart.items;
      subtotal = cart.subtotal;
      deliveryFee = cart.deliveryFee;
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array.' });
    }

    const { bestCoupon, discount } = calculateBestCoupon(items, subtotal, deliveryFee);

    if (bestCoupon) {
      const cart = await readCart();
      cart.appliedCoupon = { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description };
      cart.discount = discount;
      cart.finalTotal = cart.total - discount;
      await writeCart(cart);
    }

    res.status(200).json({
      coupon: bestCoupon ? { id: bestCoupon.id, code: bestCoupon.code, description: bestCoupon.description } : null,
      discount,
      finalTotal: subtotal + deliveryFee - discount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;