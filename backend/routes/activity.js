import express from 'express';
import Activity from '../models/Activity.js';
import NFT from '../models/NFT.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const activities = await Activity.find()
      .populate('from', 'username avatar walletAddress')
      .populate('to', 'username avatar walletAddress')
      .populate({
        path: 'nft',
        select: 'title imageUrl tokenId'
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Activity.countDocuments();

    res.json({
      activities: activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        nft: activity.nft,
        from: activity.from,
        to: activity.to,
        price: activity.price,
        currency: activity.currency,
        txHash: activity.txHash,
        createdAt: activity.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get global activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const activities = await Activity.find({
      $or: [
        { from: req.params.userId },
        { to: req.params.userId }
      ]
    })
      .populate('from', 'username avatar walletAddress')
      .populate('to', 'username avatar walletAddress')
      .populate({
        path: 'nft',
        select: 'title imageUrl tokenId'
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({
      $or: [
        { from: req.params.userId },
        { to: req.params.userId }
      ]
    });

    res.json({
      activities: activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        nft: activity.nft,
        from: activity.from,
        to: activity.to,
        price: activity.price,
        currency: activity.currency,
        txHash: activity.txHash,
        createdAt: activity.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

router.get('/nft/:nftId', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const activities = await Activity.find({ nft: req.params.nftId })
      .populate('from', 'username avatar walletAddress')
      .populate('to', 'username avatar walletAddress')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Activity.countDocuments({ nft: req.params.nftId });

    res.json({
      activities: activities.map(activity => ({
        id: activity._id,
        type: activity.type,
        nft: activity.nft,
        from: activity.from,
        to: activity.to,
        price: activity.price,
        currency: activity.currency,
        txHash: activity.txHash,
        createdAt: activity.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get NFT activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

export default router;
