import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  floorPrice: {
    type: Number,
    default: 0
  },
  totalVolume: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

collectionSchema.index({ slug: 1 });
collectionSchema.index({ creator: 1 });

const Collection = mongoose.model('Collection', collectionSchema);

export default Collection;
