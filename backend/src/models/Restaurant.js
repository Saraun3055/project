const mongoose = require('mongoose');

/**
 * Restaurant owner accounts.
 *
 * The column names deliberately keep the legacy snake_case spelling from
 * `restaurants.json` (`password_hash`, `commission_rate`, `default_prep_minutes`,
 * `is_open`, `stripe_account_id`) because the auth helpers, the Stripe Connect
 * split engine and the owner dashboard settings endpoint all read those exact
 * keys. Changing them here would mean touching every consumer for no gain.
 */
const restaurantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: '', lowercase: true, trim: true, index: true },
    password_hash: { type: String, default: '' },
    cuisine: { type: String, default: '' },
    location: { type: String, default: '' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '' },
    minimumOrder: { type: Number, default: 0 },
    coverImage: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: { type: [String], default: [] },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    is_open: { type: Boolean, default: true },
    default_prep_minutes: { type: Number, default: 18 },
    commission_rate: { type: Number, default: 0.12 },
    stripe_account_id: { type: String, default: null },
  },
  { id: false, timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
