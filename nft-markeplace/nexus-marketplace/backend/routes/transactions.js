import express from 'express';
import NFT from '../models/NFT.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const MOCK_TX_HASH = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

router.post('/list', protect, async (req, res) => {
  try {
    const { nftId, price, currency } = req.body;
    const owner = req.user;
    
    const nft = await NFT.findById(nftId);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    if (nft.owner.toString() !== owner._id.toString()) {
      return res.status(403).json({ message: 'Not the owner' });
    }
    
    nft.isListed = true;
    nft.price = price;
    nft.currency = currency || 'ETH';
    nft.listedAt = new Date();
    await nft.save();
    
    await Activity.create({
      nft: nft._id,
      type: 'list',
      from: owner._id,
      to: owner._id,
      price: price,
      currency: currency || 'ETH'
    });
    
    res.json({
      message: 'NFT listed successfully',
      nft: nft
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ message: 'Server error listing NFT' });
  }
});

router.post('/buy', protect, async (req, res) => {
  try {
    const { nftId, price, currency } = req.body;
    const buyer = req.user;
    
    const nft = await NFT.findById(nftId).populate('owner');
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    if (!nft.isListed) {
      return res.status(400).json({ message: 'NFT is not for sale' });
    }
    
    if (nft.owner._id.toString() === buyer._id.toString()) {
      return res.status(400).json({ message: 'Cannot buy your own NFT' });
    }
    
    const seller = await User.findById(nft.owner._id);
    
    nft.owner = buyer._id;
    nft.isListed = false;
    nft.price = 0;
    nft.currency = 'ETH';
    await nft.save();
    
    await Activity.create({
      nft: nft._id,
      type: 'sale',
      from: seller._id,
      to: buyer._id,
      price: price,
      currency: currency,
      txHash: MOCK_TX_HASH
    });
    
    res.json({
      message: 'Purchase successful',
      transactionHash: MOCK_TX_HASH,
      nft: nft
    });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ message: 'Server error processing purchase' });
  }
});

router.post('/offer', protect, async (req, res) => {
  try {
    const { nftId, price, currency, expiresIn } = req.body;
    const buyer = req.user;
    
    const nft = await NFT.findById(nftId);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    const offer = {
      from: buyer._id,
      price: price,
      currency: currency,
      expiresAt: new Date(Date.now() + (expiresIn || 7) * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date()
    };
    
    if (!nft.offers) {
      nft.offers = [];
    }
    nft.offers.push(offer);
    await nft.save();
    
    res.json({
      message: 'Offer submitted',
      offer: offer
    });
  } catch (error) {
    console.error('Offer error:', error);
    res.status(500).json({ message: 'Server error submitting offer' });
  }
});

router.post('/accept-offer', protect, async (req, res) => {
  try {
    const { nftId, offerIndex } = req.body;
    const seller = req.user;
    
    const nft = await NFT.findById(nftId);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    if (nft.owner.toString() !== seller._id.toString()) {
      return res.status(403).json({ message: 'Not the owner' });
    }
    
    const offer = nft.offers?.[offerIndex];
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }
    
    const buyer = await User.findById(offer.from);
    
    nft.owner = buyer._id;
    nft.isListed = false;
    nft.price = 0;
    nft.offers.splice(offerIndex, 1);
    await nft.save();
    
    await Activity.create({
      nft: nft._id,
      type: 'sale',
      from: seller._id,
      to: buyer._id,
      price: offer.price,
      currency: offer.currency,
      transactionHash: MOCK_TX_HASH
    });
    
    res.json({
      message: 'Offer accepted',
      transactionHash: MOCK_TX_HASH
    });
  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ message: 'Server error accepting offer' });
  }
});

router.post('/list', protect, async (req, res) => {
  try {
    const { nftId, price, currency } = req.body;
    const owner = req.user;
    
    const nft = await NFT.findById(nftId);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    if (nft.owner.toString() !== owner._id.toString()) {
      return res.status(403).json({ message: 'Not the owner' });
    }
    
    nft.isListed = true;
    nft.price = price;
    nft.currency = currency || 'ETH';
    await nft.save();
    
    await Activity.create({
      nft: nft._id,
      type: 'list',
      from: owner._id,
      to: owner._id,
      price: price,
      currency: currency || 'ETH'
    });
    
    res.json({
      message: 'NFT listed successfully',
      nft: nft
    });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ message: 'Server error listing NFT' });
  }
});

router.post('/delist', protect, async (req, res) => {
  try {
    const { nftId } = req.body;
    const owner = req.user;
    
    const nft = await NFT.findById(nftId);
    
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    
    if (nft.owner.toString() !== owner._id.toString()) {
      return res.status(403).json({ message: 'Not the owner' });
    }
    
    nft.isListed = false;
    await nft.save();
    
    await Activity.create({
      nft: nft._id,
      type: 'unlist',
      from: owner._id,
      to: owner._id
    });
    
    res.json({
      message: 'NFT delisted successfully',
      nft: nft
    });
  } catch (error) {
    console.error('Delist error:', error);
    res.status(500).json({ message: 'Server error delisting NFT' });
  }
});

export default router;