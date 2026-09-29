const express = require('express');
const { readDishes, readCategories, readRestaurants } = require('../dataStore');
const { toPublicRestaurant } = require('../utils/authUtils');

const router = express.Router();

const normalizeDish = (dish) => dish;

router.get('/dishes', async (req, res, next) => {
  try {
    const dishes = await readDishes();
    const restaurantId = req.query.restaurantId;
    if (restaurantId) {
      const filtered = dishes.filter((dish) => dish.restaurantId === restaurantId);
      return res.status(200).json({ dishes: filtered.map(normalizeDish) });
    }
    res.status(200).json({ dishes: dishes.map(normalizeDish) });
  } catch (error) {
    next(error);
  }
});

router.get('/dishes/:id', async (req, res, next) => {
  try {
    const dishes = await readDishes();
    const dish = dishes.find((item) => item.id === req.params.id);
    if (!dish) {
      return res.status(404).json({ error: `Dish ${req.params.id} not found.` });
    }
    res.status(200).json({ dish: normalizeDish(dish) });
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await readCategories();
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restaurants
 * Public listing. Owner credentials and the Stripe account id are stripped.
 */
router.get('/restaurants', async (req, res, next) => {
  try {
    const restaurants = await readRestaurants();
    res.status(200).json({ restaurants: restaurants.map(toPublicRestaurant) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/restaurants/:id
 * Customer facing menu page. Returns the restaurant plus its dishes grouped
 * into the categories actually present for that restaurant, so the menu is
 * built dynamically from `restaurant_id` rather than a hard coded list.
 */
router.get('/restaurants/:id', async (req, res, next) => {
  try {
    const restaurants = await readRestaurants();
    const restaurant = restaurants.find((item) => item.id === req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: `Restaurant ${req.params.id} not found.` });
    }

    const dishes = await readDishes();
    const menu = dishes.filter((dish) => dish.restaurantId === restaurant.id);

    const grouped = menu.reduce((accumulator, dish) => {
      const category = dish.category || dish.cuisine || 'Specials';
      if (!accumulator[category]) accumulator[category] = [];
      accumulator[category].push(normalizeDish(dish));
      return accumulator;
    }, {});

    const categories = Object.entries(grouped).map(([name, items]) => ({
      name,
      dishCount: items.length,
      minPrice: Math.min(...items.map((item) => Number(item.price) || 0)),
    }));

    res.status(200).json({
      restaurant: toPublicRestaurant(restaurant),
      dishes: menu.map(normalizeDish),
      categories,
      menu: grouped,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
