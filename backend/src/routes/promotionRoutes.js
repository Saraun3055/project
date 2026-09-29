const express = require('express');
const { readPromotions } = require('../dataStore');

const router = express.Router();

router.get('/promotions', async (req, res, next) => {
  try {
    const promotions = await readPromotions();
    res.status(200).json({ promotions });
  } catch (error) {
    next(error);
  }
});

module.exports = router;