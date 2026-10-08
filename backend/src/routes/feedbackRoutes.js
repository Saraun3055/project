const express = require('express');
const Feedback = require('../models/Feedback');
const { requireCustomer, optionalCustomer } = require('../middleware/requireCustomer');
const { toPlain, toPlainList } = require('../utils/serialize');

const router = express.Router();

/**
 * POST /api/feedback
 * Stores a post-order review. The customer comes from the token.
 */
router.post('/feedback', requireCustomer, async (req, res, next) => {
  try {
    const body = req.body || {};
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5.' });
    }

    const feedback = await Feedback.create({
      customerId: req.customer.id,
      orderId: body.orderId ?? null,
      transactionId: body.transactionId ?? null,
      dishId: body.dishId ?? null,
      rating,
      comment: String(body.comment ?? ''),
      createdAt: new Date(),
    });

    res.status(201).json({ feedback: toPlain(feedback) });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback?orderId= | ?transactionId=
 * A signed-in customer only ever sees their own reviews.
 */
router.get('/feedback', optionalCustomer, async (req, res, next) => {
  try {
    const filter = {};
    if (req.customer) filter.customerId = req.customer.id;
    else if (req.query.customerId) filter.customerId = req.query.customerId;

    if (req.query.orderId) filter.orderId = req.query.orderId;
    if (req.query.transactionId) filter.transactionId = req.query.transactionId;
    if (req.query.dishId) filter.dishId = req.query.dishId;

    const feedbacks = await Feedback.find(filter).sort({ createdAt: -1 }).lean();
    res.status(200).json({ feedbacks: toPlainList(feedbacks), count: feedbacks.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
