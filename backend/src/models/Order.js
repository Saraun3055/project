const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    dishId: { type: String, default: '' },
    name: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * One document per restaurant per checkout. A single customer payment that
 * spans several restaurants produces several order documents that share a
 * `transactionId` - that is what ties them back to one payment and what keeps
 * each restaurant seeing only its own order.
 */
const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    transactionId: { type: String, required: true, index: true },
    customerId: { type: String, index: true },
    customerName: { type: String, default: 'Guest' },
    customerAddress: { type: Object, default: null },
    restaurantId: { type: String, index: true },
    restaurantName: { type: String, default: '' },
    coordinates: { type: Object, default: null },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discountShare: { type: Number, default: 0 },
    deliveryFeeShare: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0.12 },
    commissionAmount: { type: Number, default: 0 },
    payoutAmount: { type: Number, default: 0 },
    transferId: { type: String, default: null },
    paymentIntentId: { type: String, default: null },
    payment: {
      status: { type: String, default: null },
      chargedAmount: { type: Number, default: 0 },
    },
    status: { type: String, default: 'Placed', index: true },
    prepMinutes: { type: Number, default: 18 },
    defaultPrepMinutes: { type: Number, default: 18 },
    acceptedAt: { type: String, default: null },
    declinedAt: { type: String, default: null },
    declineReason: { type: String, default: null },
    refundId: { type: String, default: null },
    refundedAmount: { type: Number, default: 0 },
    placedAt: { type: String, default: null },
    date: { type: String, default: null },
  },
  { id: false, timestamps: false }
);

module.exports = mongoose.model('Order', orderSchema);
