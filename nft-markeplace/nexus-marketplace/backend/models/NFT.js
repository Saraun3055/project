import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  imageUrl: {
    type: String,
    required: [true, 'Image is required']
  },
  externalLink: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'ETH'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  collection: {
    type: String,
    default: 'Unnamed Collection'
  },
  collectionSlug: {
    type: String,
    default: ''
  },
  blockchain: {
    type: String,
    default: 'ethereum'
  },
  isListed: {
    type: Boolean,
    default: false
  },
  listedAt: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  traits: [{
    trait_type: { type: String },
    value: { type: String }
  }],
  supply: {
    type: Number,
    default: 1
  },
  tokenId: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 15)
  },
  offers: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: Number,
    currency: String,
    expiresAt: Date,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

nftSchema.index({ creator: 1 });
nftSchema.index({ owner: 1 });
nftSchema.index({ collection: 1 });
nftSchema.index({ isListed: 1 });
nftSchema.index({ createdAt: -1 });
nftSchema.index({ tokenId: 1 }, { unique: true, sparse: true });

const NFT = mongoose.model('NFT', nftSchema);

export default NFT;
