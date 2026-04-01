import express from 'express';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import NFT from '../models/NFT.js';
import Offer from '../models/Offer.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

router.post('/create', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description, externalLink, collection, blockchain, supply, traits } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    let imageUrl = '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      return res.status(400).json({ message: 'Image is required' });
    }

    let parsedTraits = [];
    if (traits) {
      try {
        parsedTraits = JSON.parse(traits);
      } catch {
        parsedTraits = [];
      }
    }

    const nft = await NFT.create({
      title,
      description: description || '',
      imageUrl,
      externalLink: externalLink || '',
      collection: collection || 'Unnamed Collection',
      blockchain: blockchain || 'ethereum',
      traits: parsedTraits,
      supply: parseInt(supply) || 1,
      creator: req.user._id,
      owner: req.user._id
    });

    await Activity.create({
      type: 'mint',
      nft: nft._id,
      from: req.user._id,
      to: req.user._id
    });

    res.status(201).json({
      message: 'NFT created successfully',
      nft: {
        id: nft._id,
        title: nft.title,
        description: nft.description,
        imageUrl: nft.imageUrl,
        collection: nft.collection,
        blockchain: nft.blockchain,
        tokenId: nft.tokenId,
        createdAt: nft.createdAt
      }
    });
  } catch (error) {
    console.error('Create NFT error:', error);
    res.status(500).json({ message: 'Server error creating NFT' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const nfts = await NFT.find({ creator: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('creator', 'username avatar walletAddress');

    res.json({
      nfts: nfts.map(nft => ({
        id: nft._id,
        title: nft.title,
        description: nft.description,
        imageUrl: nft.imageUrl,
        externalLink: nft.externalLink,
        price: nft.price,
        currency: nft.currency,
        collection: nft.collection,
        blockchain: nft.blockchain,
        isListed: nft.isListed,
        tokenId: nft.tokenId,
        traits: nft.traits,
        supply: nft.supply,
        creator: nft.creator,
        createdAt: nft.createdAt
      }))
    });
  } catch (error) {
    console.error('Get user NFTs error:', error);
    res.status(500).json({ message: 'Server error fetching NFTs' });
  }
});

router.get('/user/me', protect, async (req, res) => {
  try {
    const nfts = await NFT.find({ creator: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      nfts: nfts.map(nft => ({
        id: nft._id,
        title: nft.title,
        description: nft.description,
        imageUrl: nft.imageUrl,
        price: nft.price,
        currency: nft.currency,
        collection: nft.collection,
        blockchain: nft.blockchain,
        isListed: nft.isListed,
        tokenId: nft.tokenId,
        traits: nft.traits,
        createdAt: nft.createdAt
      }))
    });
  } catch (error) {
    console.error('Get my NFTs error:', error);
    res.status(500).json({ message: 'Server error fetching NFTs' });
  }
});

router.get('/explore', async (req, res) => {
  try {
    const { limit = 20, offset = 0, collection } = req.query;
    
    let query = {};
    if (collection) {
      query.collection = collection;
    }

    const nfts = await NFT.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('creator', 'username avatar walletAddress');

    const total = await NFT.countDocuments(query);

    res.json({
      nfts: nfts.map(nft => ({
        id: nft._id,
        title: nft.title,
        description: nft.description,
        imageUrl: nft.imageUrl,
        price: nft.price,
        currency: nft.currency,
        collection: nft.collection,
        blockchain: nft.blockchain,
        tokenId: nft.tokenId,
        traits: nft.traits,
        creator: nft.creator,
        createdAt: nft.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get explore NFTs error:', error);
    res.status(500).json({ message: 'Server error fetching NFTs' });
  }
});

router.get('/opensea', async (req, res) => {
  try {
    const { collection = 'bayc', limit = 20 } = req.query;
    const apiKey = process.env.OPENSEA_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ 
        message: 'OpenSea API key not configured',
        nfts: []
      });
    }

    const response = await axios.get(
      `https://api.opensea.io/api/v2/collection/${collection}/nfts`,
      {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json'
        },
        params: {
          limit: Math.min(parseInt(limit) || 20, 50)
        }
      }
    );

    const nfts = response.data.nfts?.map((nft) => ({
      id: nft.identifier,
      title: nft.name || `${collection} #${nft.identifier}`,
      description: nft.description || '',
      imageUrl: nft.image_url || nft.contract_image_url || '',
      collection: nft.collection || collection,
      tokenId: nft.identifier,
      contractAddress: nft.contract,
      traits: nft.attributes || []
    })) || [];

    res.json({ nfts, source: 'opensea' });
  } catch (error) {
    console.error('OpenSea API error:', error.response?.data || error.message);
    res.status(200).json({ 
      nfts: [],
      error: error.response?.data?.detail || 'Failed to fetch from OpenSea'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const nft = await NFT.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('creator', 'username avatar walletAddress')
      .populate('owner', 'username avatar walletAddress');

    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const likes = nft.likes?.length || 0;

    res.json({
      nft: {
        id: nft._id,
        title: nft.title,
        description: nft.description,
        imageUrl: nft.imageUrl,
        externalLink: nft.externalLink,
        price: nft.price,
        currency: nft.currency,
        collection: nft.collection,
        blockchain: nft.blockchain,
        isListed: nft.isListed,
        listedAt: nft.listedAt,
        tokenId: nft.tokenId,
        traits: nft.traits,
        supply: nft.supply,
        creator: nft.creator,
        owner: nft.owner,
        likes,
        views: nft.views,
        createdAt: nft.createdAt
      }
    });
  } catch (error) {
    console.error('Get NFT error:', error);
    res.status(500).json({ message: 'Server error fetching NFT' });
  }
});

router.put('/:id/list', protect, async (req, res) => {
  try {
    const { price, currency = 'ETH' } = req.body;
    
    const nft = await NFT.findById(req.params.id);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const owner = nft.owner || nft.creator;
    if (owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to list this NFT' });
    }

    nft.isListed = true;
    nft.price = price;
    nft.currency = currency;
    nft.listedAt = new Date();
    await nft.save();

    await Activity.create({
      type: 'list',
      nft: nft._id,
      from: req.user._id,
      to: req.user._id,
      price,
      currency
    });

    res.json({
      message: 'NFT listed successfully',
      nft: {
        id: nft._id,
        isListed: nft.isListed,
        price: nft.price,
        currency: nft.currency,
        listedAt: nft.listedAt
      }
    });
  } catch (error) {
    console.error('List NFT error:', error);
    res.status(500).json({ message: 'Server error listing NFT' });
  }
});

router.put('/:id/unlist', protect, async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const owner = nft.owner || nft.creator;
    if (owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to unlist this NFT' });
    }

    nft.isListed = false;
    nft.listedAt = null;
    await nft.save();

    await Activity.create({
      type: 'unlist',
      nft: nft._id,
      from: req.user._id,
      to: req.user._id
    });

    res.json({
      message: 'NFT unlisted successfully',
      nft: {
        id: nft._id,
        isListed: nft.isListed
      }
    });
  } catch (error) {
    console.error('Unlist NFT error:', error);
    res.status(500).json({ message: 'Server error unlisting NFT' });
  }
});

router.post('/:id/buy', protect, async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    if (!nft.isListed) {
      return res.status(400).json({ message: 'NFT is not listed for sale' });
    }

    const previousOwner = nft.owner || nft.creator;
    const previousOwnerId = previousOwner._id || previousOwner;

    nft.owner = req.user._id;
    nft.isListed = false;
    nft.listedAt = null;
    await nft.save();

    await Activity.create({
      type: 'sale',
      nft: nft._id,
      from: previousOwnerId,
      to: req.user._id,
      price: nft.price,
      currency: nft.currency
    });

    res.json({
      message: 'NFT purchased successfully',
      nft: {
        id: nft._id,
        owner: nft.owner
      }
    });
  } catch (error) {
    console.error('Buy NFT error:', error);
    res.status(500).json({ message: 'Server error buying NFT' });
  }
});

router.post('/:id/offer', protect, async (req, res) => {
  try {
    const { price, currency = 'ETH', expiresAt } = req.body;
    
    const nft = await NFT.findById(req.params.id);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const owner = nft.owner || nft.creator;
    if (owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot make offer on your own NFT' });
    }

    const offer = await Offer.create({
      nft: nft._id,
      buyer: req.user._id,
      price,
      currency,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await Activity.create({
      type: 'offer',
      nft: nft._id,
      from: req.user._id,
      to: owner,
      price,
      currency
    });

    res.status(201).json({
      message: 'Offer created successfully',
      offer: {
        id: offer._id,
        price: offer.price,
        currency: offer.currency,
        status: offer.status
      }
    });
  } catch (error) {
    console.error('Make offer error:', error);
    res.status(500).json({ message: 'Server error creating offer' });
  }
});

router.get('/:id/offers', async (req, res) => {
  try {
    const offers = await Offer.find({ nft: req.params.id, status: 'pending' })
      .populate('buyer', 'username avatar walletAddress')
      .sort({ createdAt: -1 });

    res.json({
      offers: offers.map(offer => ({
        id: offer._id,
        buyer: offer.buyer,
        price: offer.price,
        currency: offer.currency,
        status: offer.status,
        expiresAt: offer.expiresAt,
        createdAt: offer.createdAt
      }))
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ message: 'Server error fetching offers' });
  }
});

router.put('/:id/offer/:offerId/accept', protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId);
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const nft = await NFT.findById(req.params.id);
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const owner = nft.owner || nft.creator;
    if (owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const previousOwner = owner;

    offer.status = 'accepted';
    await offer.save();

    nft.owner = offer.buyer;
    nft.isListed = false;
    nft.listedAt = null;
    await nft.save();

    await Activity.create({
      type: 'sale',
      nft: nft._id,
      from: previousOwner,
      to: offer.buyer,
      price: offer.price,
      currency: offer.currency
    });

    res.json({
      message: 'Offer accepted successfully',
      nft: {
        id: nft._id,
        owner: nft.owner
      }
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ message: 'Server error accepting offer' });
  }
});

router.put('/:id/offer/:offerId/reject', protect, async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId);
    
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const nft = await NFT.findById(req.params.id);
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const owner = nft.owner || nft.creator;
    if (owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    offer.status = 'rejected';
    await offer.save();

    res.json({
      message: 'Offer rejected successfully'
    });
  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({ message: 'Server error rejecting offer' });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const likeIndex = nft.likes.findIndex(
      userId => userId.toString() === req.user._id.toString()
    );

    let isLiked = false;
    
    if (likeIndex > -1) {
      nft.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      nft.likes.push(req.user._id);
      isLiked = true;

      await Activity.create({
        type: 'like',
        nft: nft._id,
        from: req.user._id
      });
    }

    await nft.save();

    res.json({
      message: isLiked ? 'NFT liked' : 'NFT unliked',
      isLiked,
      likes: nft.likes.length
    });
  } catch (error) {
    console.error('Like NFT error:', error);
    res.status(500).json({ message: 'Server error liking NFT' });
  }
});

router.get('/:id/activity', async (req, res) => {
  try {
    const activities = await Activity.find({ nft: req.params.id })
      .populate('from', 'username avatar walletAddress')
      .populate('to', 'username avatar walletAddress')
      .populate('nft', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(50);

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
      }))
    });
  } catch (error) {
    console.error('Get NFT activity error:', error);
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

export default router;
