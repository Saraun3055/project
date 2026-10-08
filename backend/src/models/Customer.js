const mongoose = require('mongoose');

/**
 * Customer accounts.
 *
 * `id` is the legacy string id used by the original JSON file store (`u1`,
 * `u2`, ...). Every cart, favorite and order document references it, so it is
 * kept as a real indexed column rather than being replaced by the Mongo `_id`.
 */
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    // Single-line address kept for the legacy profile screen.
    address: { type: String, default: '' },
    addresses: { type: [addressSchema], default: [] },
    preferences: {
      deliveryMode: { type: String, default: 'delivery' },
      dietPreference: { type: String, default: 'balanced' },
    },
  },
  { id: false, timestamps: true }
);

customerSchema.methods.toPublic = function toPublic() {
  const { passwordHash: _hash, __v: _v, ...safe } = this.toObject();
  return safe;
};

module.exports = mongoose.model('Customer', customerSchema);
