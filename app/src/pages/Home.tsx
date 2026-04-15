import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockNFTs, mockCollections, mockUsers } from '@/data/mockData';
import NFTCard from '@/components/NFTCard';
import CollectionCard from '@/components/CollectionCard';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  Zap,
  Shield,
  Globe,
  Users,
  Sparkles,
} from 'lucide-react';

const Home = () => {
  const [trendingNFTs] = useState(mockNFTs.slice(0, 4));
  const [notableCollections] = useState(mockCollections.slice(0, 4));
  const [topCreators] = useState(mockUsers.slice(0, 4));

  const categories = [
    { name: 'Art', icon: '🎨', color: 'from-pink-500 to-rose-500' },
    { name: 'Collectibles', icon: '🏆', color: 'from-orange-500 to-amber-500' },
    { name: 'Music', icon: '🎵', color: 'from-purple-500 to-violet-500' },
    { name: 'Photography', icon: '📷', color: 'from-blue-500 to-cyan-500' },
    { name: 'Sports', icon: '⚽', color: 'from-green-500 to-emerald-500' },
    { name: 'Gaming', icon: '🎮', color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Discover, collect, and sell extraordinary NFTs
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Nexus is the world's first and largest NFT marketplace
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/explore">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 font-semibold">
                    Explore
                  </Button>
                </Link>
                <Link to="/create">
                  <Button size="lg" variant="outline" className="border-2 border-white/50 text-white bg-white/10 hover:bg-white/20 px-8 font-semibold backdrop-blur-sm">
                    Create
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/20 rounded-3xl blur-2xl" />
                <img
                  src={mockNFTs[0].image}
                  alt="Featured NFT"
                  className="relative rounded-2xl shadow-2xl w-full aspect-square object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">500K+</p>
              <p className="text-gray-500 dark:text-gray-400">Collections</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">20M+</p>
              <p className="text-gray-500 dark:text-gray-400">NFTs</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1M+</p>
              <p className="text-gray-500 dark:text-gray-400">Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">$20B+</p>
              <p className="text-gray-500 dark:text-gray-400">Volume</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending NFTs Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Trending NFTs</h2>
              <p className="text-gray-500 dark:text-gray-400">The most popular NFTs right now</p>
            </div>
            <Link to="/explore">
              <Button variant="outline" className="gap-2 border-gray-200 dark:border-slate-700">
                View all
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/explore?category=${category.name.toLowerCase()}`}
                className="group"
              >
                <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-white text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <span className="text-4xl mb-3 block">{category.icon}</span>
                  <p className="font-semibold">{category.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Notable Collections Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notable Collections</h2>
              <p className="text-gray-500 dark:text-gray-400">Top collections by volume and floor price</p>
            </div>
            <Link to="/explore">
              <Button variant="outline" className="gap-2 border-gray-200 dark:border-slate-700">
                View all
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {notableCollections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
            Top Creators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {topCreators.map((creator, index) => (
              <Link
                key={creator.id}
                to={`/profile/${creator.address}`}
                className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={creator.avatar}
                    alt={creator.username}
                    className="w-20 h-20 rounded-full object-cover mx-auto"
                  />
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{creator.username}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{creator.followers.toLocaleString()} followers</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-12 text-center">
            Why Choose Nexus
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Largest NFT Marketplace</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">The world's first and largest digital marketplace for crypto collectibles</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Secure & Transparent</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">All transactions are secured by blockchain technology</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Gas-Free Trading</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Trade NFTs without paying gas fees on Polygon</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Active Community</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Join millions of NFT enthusiasts and creators</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Sparkles className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Start Your NFT Journey Today</h2>
          <p className="text-xl text-white/90 mb-8">
            Join the world's largest NFT marketplace and discover unique digital assets
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 font-semibold">
                Explore NFTs
              </Button>
            </Link>
            <Link to="/create">
              <Button size="lg" variant="outline" className="border-2 border-white/50 text-white bg-white/10 hover:bg-white/20 px-8 font-semibold backdrop-blur-sm">
                Create NFT
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
