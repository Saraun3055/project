import mongoose from 'mongoose';
import User from './models/User.js';
import NFT from './models/NFT.js';

await mongoose.connect('mongodb://localhost:27017/nexus_marketplace');

const users = await User.find({}, '_id email username role');
console.log('Users:');
users.forEach(u => console.log(`  ${u._id} | ${u.email} | ${u.username} | ${u.role}`));

console.log('\nNFTs:');
const nfts = await NFT.find({}).populate('owner', 'username email');
nfts.forEach(n => console.log(`  ${n.title} | Owner: ${n.owner?.username} | Listed: ${n.isListed}`));

await mongoose.disconnect();