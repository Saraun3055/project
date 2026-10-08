const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    dishId: { type: String, required: true },
    restaurantId: { type: String, default: 'unknown' },
    restaurantName: { type: String, default: '' },
    name: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * One cart per customer. The old store kept a single global `cart.json`
 * shared by everybody; keying it on `customerId` is what makes the cart
 * per-user.
 */
const cartSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    deliveryFeePerRestaurant: { type: Number, default: 40 },
    total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    finalTotal: { type: Number, default: 0 },
    appliedCoupon: { type: Object, default: null },
  },
  { id: false, timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
