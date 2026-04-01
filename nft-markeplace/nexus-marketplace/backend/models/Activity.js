import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mint', 'list', 'unlist', 'sale', 'offer', 'transfer', 'like'],
    required: true
  },
  nft: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  price: {
    type: Number
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  txHash: {
    type: String
  }
}, {
  timestamps: true
});

activitySchema.index({ createdAt: -1 });
activitySchema.index({ nft: 1, createdAt: -1 });
activitySchema.index({ from: 1, createdAt: -1 });
activitySchema.index({ to: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
