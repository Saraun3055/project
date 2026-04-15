import express from 'express';
import User from '../models/User.js';
import NFT from '../models/NFT.js';
import Collection from '../models/Collection.js';
import Offer from '../models/Offer.js';
import Activity from '../models/Activity.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(isAdmin);

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNFTs = await NFT.countDocuments();
    const totalCollections = await Collection.countDocuments();
    const listedNFTs = await NFT.countDocuments({ isListed: true });
    const totalVolume = await NFT.aggregate([
      { $match: { isListed: true } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    res.json({
      users: totalUsers,
      nfts: totalNFTs,
      collections: totalCollections,
      listedNFTs,
      totalVolume: totalVolume[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search ? { username: { $regex: search, $options: 'i' } } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userNFTs = await NFT.find({ creator: req.params.id });
    const nftIds = userNFTs.map(nft => nft._id);
    
    await NFT.deleteMany({ owner: req.params.id });
    await NFT.deleteMany({ creator: req.params.id });
    await Collection.deleteMany({ creator: req.params.id });
    await Offer.deleteMany({ buyer: req.params.id });
    await Offer.deleteMany({ nft: { $in: nftIds } });
    await Activity.deleteMany({ from: req.params.id });
    await Activity.deleteMany({ to: req.params.id });
    await Activity.deleteMany({ nft: { $in: nftIds } });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/ban', async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/nfts', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', collection = '' } = req.query;
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (collection) {
      query.collection = collection;
    }
    
    const nfts = await NFT.find(query)
      .populate('owner', 'username email')
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await NFT.countDocuments(query);
    
    res.json({
      nfts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/nfts/:id/list', async (req, res) => {
  try {
    const { isListed } = req.body;
    const nft = await NFT.findByIdAndUpdate(
      req.params.id,
      { isListed },
      { new: true }
    ).populate('owner', 'username email').populate('creator', 'username email');
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    res.json(nft);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/nfts/:id', async (req, res) => {
  try {
    const nft = await NFT.findByIdAndDelete(req.params.id);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    res.json({ message: 'NFT deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/collections', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};
    
    const collections = await Collection.find(query)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Collection.countDocuments(query);
    
    res.json({
      collections,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/collections/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).populate('creator', 'username email');
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/collections/:id', async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    await NFT.deleteMany({ collectionSlug: collection.slug });
    
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;