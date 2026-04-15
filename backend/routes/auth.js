import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = await User.create({
      username,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        walletAddress: user.walletAddress,
        verified: user.verified,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned. Contact admin.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        banner: user.banner,
        walletAddress: user.walletAddress,
        verified: user.verified,
        role: user.role,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        banner: user.banner,
        walletAddress: user.walletAddress,
        verified: user.verified,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { username, bio, avatar, banner } = req.body;

    const updateFields = {};
    if (username) updateFields.username = username;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (banner !== undefined) updateFields.banner = banner;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        banner: user.banner,
        walletAddress: user.walletAddress,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

router.post('/link-wallet', protect, async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    const existingUser = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase(),
      _id: { $ne: req.user._id }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'This wallet is already linked to another account' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true }
    );

    res.json({
      message: 'Wallet linked successfully',
      user: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error('Link wallet error:', error);
    res.status(500).json({ message: 'Server error linking wallet' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        banner: user.banner,
        walletAddress: user.walletAddress,
        verified: user.verified,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/follow/:userId', protect, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const user = await User.findById(req.user._id);
    const isFollowing = user.following.includes(req.params.userId);

    if (isFollowing) {
      user.following = user.following.filter(id => id.toString() !== req.params.userId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user._id.toString());
    } else {
      user.following.push(req.params.userId);
      userToFollow.followers.push(req.user._id);
    }

    await user.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
