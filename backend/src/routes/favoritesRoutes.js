const express = require('express');
const { readFavorites, writeFavorites, readDishes } = require('../dataStore');

const router = express.Router();

/**
 * GET /api/favorites
 * Returns all saved favorite dishes for the current user.
 * Optionally filter by ?customerId=
 */
router.get('/favorites', async (req, res, next) => {
  try {
    const favorites = await readFavorites();
    const { customerId } = req.query;

    const filtered = customerId
      ? favorites.filter((item) => item.customerId === customerId)
      : favorites;

    res.status(200).json({ favorites: filtered, count: filtered.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/favorites
 * Add a dish to favorites.
 * Body: { dishId, customerId? }
 */
router.post('/favorites', async (req, res, next) => {
  try {
    const body = req.body || {};
    const { dishId, customerId = 'u1' } = body;

    if (!dishId) {
      return res.status(400).json({ error: 'dishId is required.' });
    }

    // Validate that the dish exists
    const dishes = await readDishes();
    const dish = dishes.find((item) => item.id === dishId);
    if (!dish) {
      return res.status(404).json({ error: `Dish ${dishId} not found.` });
    }

    const favorites = await readFavorites();

    // Prevent duplicate favorites for the same customer
    const alreadySaved = favorites.some(
      (item) => item.dishId === dishId && item.customerId === customerId
    );
    if (alreadySaved) {
      return res.status(409).json({
        error: 'Dish is already in favorites.',
        favorite: favorites.find((item) => item.dishId === dishId && item.customerId === customerId),
      });
    }

    const newFavorite = {
      id: `fav-${Date.now().toString(36)}`,
      customerId,
      dishId: dish.id,
      dishName: dish.name,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurantName,
      price: dish.price,
      healthMeterScore: dish.healthMeterScore ?? null,
      imageUrl: dish.imageUrl ?? null,
      isVeg: dish.isVeg ?? null,
      savedAt: new Date().toISOString(),
    };

    favorites.unshift(newFavorite);
    await writeFavorites(favorites);

    res.status(201).json({ favorite: newFavorite, total: favorites.length });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/favorites/:dishId
 * Remove a dish from favorites.
 * Optionally scope by ?customerId=
 */
router.delete('/favorites/:dishId', async (req, res, next) => {
  try {
    const { dishId } = req.params;
    const { customerId } = req.query;

    const favorites = await readFavorites();
    const before = favorites.length;

    const updated = favorites.filter((item) => {
      if (item.dishId !== dishId) return true;
      if (customerId && item.customerId !== customerId) return true;
      return false;
    });

    if (updated.length === before) {
      return res.status(404).json({ error: `Dish ${dishId} not found in favorites.` });
    }

    await writeFavorites(updated);
    res.status(200).json({ message: 'Removed from favorites.', total: updated.length });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/favorites
 * Clear all favorites for a customer.
 * Requires ?customerId=
 */
router.delete('/favorites', async (req, res, next) => {
  try {
    const { customerId } = req.query;

    if (!customerId) {
      return res.status(400).json({ error: 'customerId query parameter is required to clear favorites.' });
    }

    const favorites = await readFavorites();
    const updated = favorites.filter((item) => item.customerId !== customerId);
    await writeFavorites(updated);

    res.status(200).json({ message: `All favorites cleared for customer ${customerId}.`, total: updated.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
