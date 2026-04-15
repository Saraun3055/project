import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

await mongoose.connect('mongodb://localhost:27017/nexus_marketplace');

const email = 'sarauntp2@gmail.com';
const password = 'Saraun@3055';
const username = 'saraun';

const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
  username,
  email,
  password: hashedPassword,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
  role: 'admin',
  isVerified: false
});

console.log(`Created admin account: ${email} with password: ${password}`);
console.log(`User ID: ${user._id}`);

await mongoose.disconnect();