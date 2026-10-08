const express = require('express');
const Restaurant = require('../models/Restaurant');
const { verifyPassword, signJwt, requireRestaurant, toOwnerRestaurant } = require('../utils/authUtils');
const { toPlain } = require('../utils/serialize');

const router = express.Router();

/** Snapshot of every restaurant as plain objects, for the auth guard. */
const loadRestaurants = async () => {
  const restaurants = await Restaurant.find().lean();
  return restaurants.map(toPlain);
};

/**
 * POST /api/auth/restaurant/login
 * Exchanges restaurant owner credentials for a signed JWT.
 */
router.post('/auth/restaurant/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const restaurant = await Restaurant.findOne({ email }).lean();

    // Same message for unknown email and wrong password so the endpoint does
    // not confirm which restaurant emails exist.
    if (!restaurant || !verifyPassword(password, restaurant.password_hash)) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const { token } = signJwt({
      sub: restaurant.id,
      restaurantId: restaurant.id,
      email: restaurant.email,
      name: restaurant.name,
      role: 'restaurant',
    });

    return res.status(200).json({
      token,
      expiresInSeconds: 60 * 60 * 12,
      restaurant: toOwnerRestaurant(restaurant),
    });
  } catch (error) {
    return next(error);
  }
});

const auth = requireRestaurant(loadRestaurants);

/**
 * GET /api/auth/restaurant/me
 * Rehydrates the signed-in owner, used on app start to restore the session.
 */
router.get('/auth/restaurant/me', auth, (req, res) => {
  res.status(200).json({ restaurant: toOwnerRestaurant(req.restaurant) });
});

module.exports = router;
module.exports.auth = auth;
module.exports.loadRestaurants = loadRestaurants;
