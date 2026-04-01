import express from 'express';
import Collection from '../models/Collection.js';
import NFT from '../models/NFT.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, image, banner } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Collection name is required' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existingCollection = await Collection.findOne({ slug });
    if (existingCollection) {
      return res.status(400).json({ message: 'Collection with this name already exists' });
    }

    const collection = await Collection.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      banner: banner || '',
      creator: req.user._id
    });

    res.status(201).json({
      message: 'Collection created successfully',
      collection: {
        id: collection._id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        banner: collection.banner,
        creator: collection.creator,
        createdAt: collection.createdAt
      }
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ message: 'Server error creating collection' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { sort = 'createdAt', limit = 20, offset = 0 } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === 'volume') {
      sortOption = { totalVolume: -1 };
    } else if (sort === 'floorPrice') {
      sortOption = { floorPrice: -1 };
    }

    const collections = await Collection.find()
      .sort(sortOption)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('creator', 'username avatar walletAddress');

    const total = await Collection.countDocuments();

    res.json({
      collections: collections.map(collection => ({
        id: collection._id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        banner: collection.banner,
        creator: collection.creator,
        isVerified: collection.isVerified,
        floorPrice: collection.floorPrice,
        totalVolume: collection.totalVolume,
        createdAt: collection.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ message: 'Server error fetching collections' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug })
      .populate('creator', 'username avatar walletAddress');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const itemCount = await NFT.countDocuments({ collection: collection.name });
    const ownerCount = await NFT.distinct('owner', { collection: collection.name }).then(owners => owners.length);

    res.json({
      collection: {
        id: collection._id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        banner: collection.banner,
        creator: collection.creator,
        isVerified: collection.isVerified,
        floorPrice: collection.floorPrice,
        totalVolume: collection.totalVolume,
        itemCount,
        ownerCount,
        createdAt: collection.createdAt
      }
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ message: 'Server error fetching collection' });
  }
});

router.get('/:slug/nfts', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const collection = await Collection.findOne({ slug: req.params.slug });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const nfts = await NFT.find({ collection: collection.name })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('creator', 'username avatar walletAddress')
      .populate('owner', 'username avatar walletAddress');

    const total = await NFT.countDocuments({ collection: collection.name });

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
        creator: nft.creator,
        owner: nft.owner,
        likes: nft.likes?.length || 0,
        createdAt: nft.createdAt
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get collection NFTs error:', error);
    res.status(500).json({ message: 'Server error fetching NFTs' });
  }
});

export default router;
