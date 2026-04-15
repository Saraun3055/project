import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  avatar: String,
  bio: String,
  walletAddress: String,
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  followers: { type: Number, default: 0 },
  following: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const collectionSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String,
  banner: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  floorPrice: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const nftSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String,
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'ETH' },
  collection: String,
  collectionSlug: String,
  tokenId: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isListed: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  traits: [{ trait_type: String, value: String }],
  blockchain: { type: String, default: 'ethereum' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
const NFT = mongoose.models.NFT || mongoose.model('NFT', nftSchema);

const testUsers = [
  { username: 'CryptoKing', email: 'king@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoking', bio: 'NFT collector since 2021', isVerified: true, role: 'admin', followers: 12500, following: 450 },
  { username: 'NFTWhale', email: 'whale@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nftwhale', bio: 'Building the future of digital ownership', isVerified: true, followers: 8900, following: 230 },
  { username: 'ArtLover', email: 'art@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artlover', isVerified: false, followers: 1200, following: 890 },
  { username: 'DigitalCreator', email: 'creator@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=digitalcreator', bio: 'Creating unique digital experiences', isVerified: true, followers: 5600, following: 180 },
  { username: 'MetaArtist', email: 'meta@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=metaartist', bio: 'Digital artist exploring the metaverse', isVerified: true, followers: 3200, following: 150 }
];

const testCollections = [
  { name: 'Bored Ape Yacht Club', slug: 'bored-ape-yacht-club', description: 'The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs that serve as membership tokens to the club.', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop', banner: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1920&h=400&fit=crop', isVerified: true, floorPrice: 14.5, totalVolume: 850000 },
  { name: 'CryptoPunks', slug: 'cryptopunks', description: '10,000 unique collectible characters with proof of ownership stored on the Ethereum blockchain.', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop', banner: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1920&h=400&fit=crop', isVerified: true, floorPrice: 45.2, totalVolume: 1200000 },
  { name: 'Azuki', slug: 'azuki', description: 'A brand for the metaverse, built by the community.', image: 'https://images.unsplash.com/photo-1633186223077-85e35c50a479?w=400&h=400&fit=crop', banner: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1920&h=400&fit=crop', isVerified: true, floorPrice: 5.8, totalVolume: 320000 },
  { name: 'Doodles', slug: 'doodles', description: 'A community-driven collectibles project featuring art by Burnt Toast.', image: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=400&h=400&fit=crop', banner: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1920&h=400&fit=crop', isVerified: true, floorPrice: 2.3, totalVolume: 180000 },
  { name: 'CloneX', slug: 'clonex', description: '20,000 next-gen Avatars, by RTFKT and Takashi Murakami.', image: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&h=400&fit=crop', banner: 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=1920&h=400&fit=crop', isVerified: true, floorPrice: 3.1, totalVolume: 240000 }
];

const testNFTs = [
  { title: 'Bored Ape #1234', description: 'A unique Bored Ape with rare traits including golden fur and laser eyes', collection: 'Bored Ape Yacht Club', collectionSlug: 'bored-ape-yacht-club', tokenId: '1234', price: 15.5, currency: 'ETH', isListed: true, likes: 245, views: 1520, traits: [{ trait_type: 'Fur', value: 'Golden' }, { trait_type: 'Eyes', value: 'Laser' }, { trait_type: 'Background', value: 'Purple' }], imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop' },
  { title: 'Bored Ape #5678', description: 'Cool Bored Ape with sunglasses and party hat', collection: 'Bored Ape Yacht Club', collectionSlug: 'bored-ape-yacht-club', tokenId: '5678', price: 12.8, currency: 'ETH', isListed: true, likes: 189, views: 980, traits: [{ trait_type: 'Accessory', value: 'Sunglasses' }, { trait_type: 'Hat', value: 'Party Hat' }], imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop' },
  { title: 'CryptoPunk #9012', description: 'Rare CryptoPunk with punk Mohawk', collection: 'CryptoPunks', collectionSlug: 'cryptopunks', tokenId: '9012', price: 45.0, currency: 'ETH', isListed: true, likes: 567, views: 3200, traits: [{ trait_type: 'Type', value: 'Alien' }, { trait_type: 'Accessory', value: 'Mohawk' }], imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=600&h=600&fit=crop' },
  { title: 'Azuki #3456', description: 'An Azuki with legendary fire traits', collection: 'Azuki', collectionSlug: 'azuki', tokenId: '3456', price: 6.2, currency: 'ETH', isListed: true, likes: 312, views: 1800, traits: [{ trait_type: 'Type', value: 'Human' }, { trait_type: 'Hair', value: 'Pink' }], imageUrl: 'https://images.unsplash.com/photo-1633186223077-85e35c50a479?w=600&h=600&fit=crop' },
  { title: 'Doodle #7890', description: 'Adorable Doodle with rainbow background', collection: 'Doodles', collectionSlug: 'doodles', tokenId: '7890', price: 2.8, currency: 'ETH', isListed: true, likes: 156, views: 720, traits: [{ trait_type: 'Background', value: 'Rainbow' }, { trait_type: 'Face', value: 'Happy' }], imageUrl: 'https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?w=600&h=600&fit=crop' },
  { title: 'CloneX #2468', description: 'Futuristic CloneX avatar', collection: 'CloneX', collectionSlug: 'clonex', tokenId: '2468', price: 3.5, currency: 'ETH', isListed: true, likes: 98, views: 450, traits: [{ trait_type: 'DNA', value: 'Futuristic' }], imageUrl: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=600&h=600&fit=crop' },
  { title: 'Bored Ape #8642', description: 'Bored Ape with laser eyes - extremely rare', collection: 'Bored Ape Yacht Club', collectionSlug: 'bored-ape-yacht-club', tokenId: '8642', price: 25.0, currency: 'ETH', isListed: false, likes: 890, views: 5400, traits: [{ trait_type: 'Fur', value: 'Dark' }, { trait_type: 'Eyes', value: 'Laser' }], imageUrl: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600&h=600&fit=crop' },
  { title: 'CryptoPunk #1111', description: 'Classic CryptoPunk with cigarrete', collection: 'CryptoPunks', collectionSlug: 'cryptopunks', tokenId: '1111', price: 38.5, currency: 'ETH', isListed: true, likes: 445, views: 2100, traits: [{ trait_type: 'Type', value: 'Male' }, { trait_type: 'Accessory', value: 'Cigarette' }], imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=600&fit=crop' }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus_marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Collection.deleteMany({});
    await NFT.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany(testUsers.map(u => ({ ...u, password: hashedPassword })));
    console.log(`Created ${users.length} users`);

    const collections = await Collection.insertMany(testCollections.map((c, i) => ({
      ...c,
      creator: users[i % users.length]._id
    })));
    console.log(`Created ${collections.length} collections`);

    const nfts = await NFT.insertMany(testNFTs.map((nft, i) => ({
      ...nft,
      owner: users[i % users.length]._id,
      creator: users[(i + 1) % users.length]._id,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    })), { ordered: false });
    console.log(`Created ${nfts.length} NFTs`);

    console.log('\n✅ Seed data added successfully!');
    console.log('\nTest accounts:');
    console.log('  Email: king@example.com | Password: password123 (Admin)');
    console.log('  Email: whale@example.com | Password: password123');
    console.log('  Email: art@example.com | Password: password123');
    console.log('  Email: creator@example.com | Password: password123');
    console.log('  Email: meta@example.com | Password: password123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();