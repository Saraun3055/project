const express = require('express');
const Favorite = require('../models/Favorite');
const Dish = require('../models/Dish');
const { requireCustomer } = require('../middleware/requireCustomer');
const { toPlain } = require('../utils/serialize');

const router = express.Router();

// Every favorites endpoint is scoped to the signed-in customer.
router.use('/favorites', requireCustomer);

/**
 * GET /api/favorites
 * Returns all saved favorite dishes for the current user.
 */
router.get('/favorites', async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ customerId: req.customer.id })
      .sort({ savedAt: -1 })
      .lean();

    res.status(200).json({ favorites: favorites.map(toPlain), count: favorites.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/favorites
 * Add a dish to favorites. Body: { dishId }
 */
router.post('/favorites', async (req, res, next) => {
  try {
    const { dishId } = req.body || {};
    if (!dishId) {
      return res.status(400).json({ error: 'dishId is required.' });
    }

    const dish = await Dish.findOne({ id: dishId }).lean();
    if (!dish) {
      return res.status(404).json({ error: `Dish ${dishId} not found.` });
    }

    const existing = await Favorite.findOne({
      customerId: req.customer.id,
      dishId: dish.id,
    }).lean();

    if (existing) {
      return res.status(409).json({
        error: 'Dish is already in favorites.',
        favorite: toPlain(existing),
      });
    }

    const favorite = await Favorite.create({
      id: `fav-${Date.now().toString(36)}`,
      customerId: req.customer.id,
      dishId: dish.id,
      dishName: dish.name,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurantName,
      price: dish.price,
      healthMeterScore: dish.healthMeterScore ?? null,
      imageUrl: dish.imageUrl ?? null,
      isVeg: dish.isVeg ?? null,
      savedAt: new Date(),
    });

    const total = await Favorite.countDocuments({ customerId: req.customer.id });
    res.status(201).json({ favorite: toPlain(favorite), total });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Dish is already in favorites.' });
    }
    next(error);
  }
});

/**
 * DELETE /api/favorites/:dishId
 * Remove a dish from favorites.
 */
router.delete('/favorites/:dishId', async (req, res, next) => {
  try {
    const result = await Favorite.deleteOne({
      customerId: req.customer.id,
      dishId: req.params.dishId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `Dish ${req.params.dishId} not found in favorites.` });
    }

    const total = await Favorite.countDocuments({ customerId: req.customer.id });
    res.status(200).json({ message: 'Removed from favorites.', total });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/favorites
 * Clear every favorite the customer has saved.
 */
router.delete('/favorites', async (req, res, next) => {
  try {
    const result = await Favorite.deleteMany({ customerId: req.customer.id });
    res.status(200).json({
      message: `All favorites cleared for customer ${req.customer.id}.`,
      total: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
