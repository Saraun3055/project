const express = require('express');
const Dish = require('../models/Dish');
const Category = require('../models/Category');
const { requireAdmin } = require('../middleware/requireAdmin');
const { toPlain, toPlainList } = require('../utils/serialize');

const router = express.Router();

const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// Every endpoint below is admin-only.
router.use('/admin', requireAdmin);

/* ------------------------------- Dishes -------------------------------- */

router.get('/admin/dishes', async (req, res, next) => {
  try {
    const filter = req.query.restaurantId ? { restaurantId: req.query.restaurantId } : {};
    const dishes = await Dish.find(filter).sort({ id: 1 }).lean();
    res.status(200).json({ dishes: toPlainList(dishes) });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/dishes', async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = String(body.name ?? '').trim();
    const price = Number(body.price);

    if (!name) return res.status(400).json({ error: 'name is required.' });
    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number.' });
    }

    const dish = await Dish.create({
      id: body.id || makeId('d'),
      name,
      description: body.description ?? '',
      price,
      cuisine: body.cuisine ?? '',
      category: body.category ?? '',
      spiceLevel: body.spiceLevel ?? 'Medium',
      isVeg: Boolean(body.isVeg),
      restaurantId: body.restaurantId ?? '',
      restaurantName: body.restaurantName ?? '',
      imageUrl: body.imageUrl ?? '',
      rating: Number(body.rating) || 0,
      deliveryTime: body.deliveryTime ?? '',
      healthMeterScore: Number(body.healthMeterScore) || Number(body.healthMeter?.score) || 60,
      healthMeter: body.healthMeter ?? { score: body.healthMeterScore ?? 60 },
    });

    res.status(201).json({ dish: toPlain(dish) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: `Dish id ${req.body?.id} already exists.` });
    }
    next(error);
  }
});

/**
 * PUT /api/admin/dishes/:id
 * Partial update. Accepts either `healthMeter: { score, ... }` or the flat
 * `healthMeterScore`, and the model keeps the two in sync on save.
 */
router.put('/admin/dishes/:id', async (req, res, next) => {
  try {
    const dish = await Dish.findOne({ id: req.params.id });
    if (!dish) return res.status(404).json({ error: `Dish ${req.params.id} not found.` });

    const body = req.body || {};

    const scalarFields = [
      'name', 'description', 'cuisine', 'category', 'spiceLevel',
      'restaurantId', 'restaurantName', 'imageUrl', 'deliveryTime',
    ];
    scalarFields.forEach((field) => {
      if (body[field] !== undefined) dish[field] = body[field];
    });

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ error: 'price must be a non-negative number.' });
      }
      dish.price = price;
    }
    if (body.isVeg !== undefined) dish.isVeg = Boolean(body.isVeg);
    if (body.rating !== undefined) dish.rating = Number(body.rating) || 0;

    if (body.healthMeter !== undefined && body.healthMeter !== null) {
      dish.healthMeter = { ...dish.healthMeter?.toObject?.() ?? dish.healthMeter, ...body.healthMeter };
    }
    if (body.healthMeterScore !== undefined) {
      dish.healthMeterScore = Number(body.healthMeterScore);
      dish.healthMeter.score = Number(body.healthMeterScore);
    }

    await dish.save();
    res.status(200).json({ dish: toPlain(dish) });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/dishes/:id', async (req, res, next) => {
  try {
    const result = await Dish.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `Dish ${req.params.id} not found.` });
    }
    res.status(200).json({ message: `Dish ${req.params.id} deleted.`, id: req.params.id });
  } catch (error) {
    next(error);
  }
});

/* ----------------------------- Categories ------------------------------ */

router.get('/admin/categories', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, id: 1 }).lean();
    res.status(200).json({ categories: toPlainList(categories) });
  } catch (error) {
    next(error);
  }
});

router.post('/admin/categories', async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = String(body.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'name is required.' });

    const category = await Category.create({
      id: body.id || makeId('c'),
      name,
      emoji: body.emoji || '🍽️',
      displayOrder: Number(body.displayOrder) || 0,
    });

    res.status(201).json({ category: toPlain(category) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: `Category id ${req.body?.id} already exists.` });
    }
    next(error);
  }
});

router.put('/admin/categories/:id', async (req, res, next) => {
  try {
    const category = await Category.findOne({ id: req.params.id });
    if (!category) return res.status(404).json({ error: `Category ${req.params.id} not found.` });

    const body = req.body || {};
    if (body.name !== undefined) category.name = body.name;
    if (body.emoji !== undefined) category.emoji = body.emoji;
    if (body.displayOrder !== undefined) category.displayOrder = Number(body.displayOrder) || 0;

    await category.save();
    res.status(200).json({ category: toPlain(category) });
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/categories/:id', async (req, res, next) => {
  try {
    const result = await Category.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `Category ${req.params.id} not found.` });
    }
    res.status(200).json({ message: `Category ${req.params.id} deleted.`, id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
