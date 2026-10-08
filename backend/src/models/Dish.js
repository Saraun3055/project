const mongoose = require('mongoose');

const healthMeterSchema = new mongoose.Schema(
  {
    score: { type: Number, default: 60 },
    calories: { type: Number, default: null },
    protein: { type: Number, default: null },
    carbs: { type: Number, default: null },
    fat: { type: Number, default: null },
    fiber: { type: Number, default: null },
  },
  { _id: false }
);

/**
 * Menu items.
 *
 * `healthMeter.score` is the nested copy the Health Meter feature reads;
 * `healthMeterScore` is kept as a flat mirror because the existing screens and
 * the favorites endpoint already read that exact field name.
 */
const dishSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    cuisine: { type: String, default: '' },
    category: { type: String, default: '' },
    spiceLevel: { type: String, default: 'Medium' },
    isVeg: { type: Boolean, default: false },
    restaurantId: { type: String, index: true },
    restaurantName: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '' },
    healthMeterScore: { type: Number, default: 60 },
    healthMeter: { type: healthMeterSchema, default: () => ({}) },
  },
  { id: false, timestamps: true }
);

dishSchema.pre('validate', function syncHealthMeter() {
  if (this.healthMeter && typeof this.healthMeter.score === 'number') {
    this.healthMeterScore = this.healthMeter.score;
  } else if (typeof this.healthMeterScore === 'number') {
    if (!this.healthMeter) this.healthMeter = {};
    this.healthMeter.score = this.healthMeterScore;
  }
});

module.exports = mongoose.model('Dish', dishSchema);
