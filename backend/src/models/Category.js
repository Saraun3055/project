const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    emoji: { type: String, default: '🍽️' },
    displayOrder: { type: Number, default: 0 },
  },
  { id: false, timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
