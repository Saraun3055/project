const mongoose = require('mongoose');

/** Post-order review written from the feedback screen. */
const feedbackSchema = new mongoose.Schema(
  {
    customerId: { type: String, index: true },
    orderId: { type: String, index: true },
    transactionId: { type: String, default: null, index: true },
    dishId: { type: String, default: null, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { id: false, timestamps: false }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
