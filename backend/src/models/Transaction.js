const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentIntentId: { type: String, default: null },
    transferGroup: { type: String, default: null },
    mode: { type: String, default: 'simulated' },
    status: { type: String, default: 'succeeded' },
    currency: { type: String, default: 'inr' },
    chargedAmount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    platformTotal: { type: Number, default: 0 },
    reconciled: { type: Boolean, default: false },
    splits: { type: [Object], default: [] },
    transfers: { type: [Object], default: [] },
    reversals: { type: [Object], default: [] },
  },
  { _id: false }
);

/**
 * One customer payment. The Stripe Connect split (`splits`, `transfers` and
 * any `reversals` raised when a restaurant declines) lives here so the
 * multi-vendor payout trail survives the move off the JSON file store.
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, index: true },
    customerName: { type: String, default: 'Guest' },
    customerAddress: { type: Object, default: null },
    placedAt: { type: String, default: null },
    simulationStartedAt: { type: String, default: null },
    timeScale: { type: Number, default: 1 },
    orderIds: { type: [String], default: [] },
    payment: { type: paymentSchema, default: () => ({}) },
  },
  { id: false, timestamps: false }
);

module.exports = mongoose.model('Transaction', transactionSchema);
