import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  nft: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

offerSchema.index({ nft: 1, buyer: 1 });
offerSchema.index({ status: 1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;
