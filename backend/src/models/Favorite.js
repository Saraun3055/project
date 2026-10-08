const mongoose = require('mongoose');

/**
 * A customer's saved dish. The dish's display fields are denormalised onto
 * the favorite so the wishlist screen never has to fan out into `dishes`.
 */
const favoriteSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `fav-${Date.now().toString(36)}` },
    customerId: { type: String, required: true, index: true },
    dishId: { type: String, required: true, index: true },
    dishName: { type: String, default: '' },
    restaurantId: { type: String, default: '' },
    restaurantName: { type: String, default: '' },
    price: { type: Number, default: 0 },
    healthMeterScore: { type: Number, default: null },
    imageUrl: { type: String, default: null },
    isVeg: { type: Boolean, default: null },
    savedAt: { type: Date, default: Date.now },
  },
  { id: false, timestamps: false }
);

favoriteSchema.index({ customerId: 1, dishId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
