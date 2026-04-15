import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

await mongoose.connect('mongodb://localhost:27017/nexus_marketplace');

const email = 'sarauntp2@gmail.com';
const password = 'Saraun@3055';

console.log('Looking up user:', email);

const user = await User.findOne({ email }).select('+password');

if (!user) {
  console.log('User not found!');
  await mongoose.disconnect();
  process.exit(1);
}

console.log('User found:', user.username, user.role);
console.log('Stored hash:', user.password.substring(0, 60));

const isMatch = await user.comparePassword(password);
console.log('Password match:', isMatch);

if (isMatch) {
  console.log('SUCCESS: Login should work!');
} else {
  console.log('FAILURE: Password does not match');
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash would be:', newHash);
}

await mongoose.disconnect();