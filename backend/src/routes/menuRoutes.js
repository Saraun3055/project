const express = require('express');
const Dish = require('../models/Dish');
const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const { toPublicRestaurant } = require('../utils/authUtils');
const { toPlain, toPlainList } = require('../utils/serialize');

const router = express.Router();

const normalizeDish = (dish) => toPlain(dish);

router.get('/dishes', async (req, res, next) => {
  try {
    const restaurantId = req.query.restaurantId;
    const filter = restaurantId ? { restaurantId } : {};
    const dishes = await Dish.find(filter).lean();
    res.status(200).json({ dishes: toPlainList(dishes) });
  } catch (error) {
    next(error);
  }
});

router.get('/dishes/:id', async (req, res, next) => {
  try {
    const dish = await Dish.findOne({ id: req.params.id }).lean();
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
    const categories = await Category.find().sort({ displayOrder: 1, id: 1 }).lean();
    res.status(200).json({ categories: toPlainList(categories) });
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
    const restaurants = await Restaurant.find().lean();
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
    const restaurant = await Restaurant.findOne({ id: req.params.id }).lean();
    if (!restaurant) {
      return res.status(404).json({ error: `Restaurant ${req.params.id} not found.` });
    }

    const menu = await Dish.find({ restaurantId: restaurant.id }).lean();

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
