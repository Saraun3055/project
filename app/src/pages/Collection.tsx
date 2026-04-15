import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockCollections, mockNFTs, NFT_PLACEHOLDER } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import NFTCard from '@/components/NFTCard';
import {
  Grid3X3,
  Activity,
  BarChart3,
  Users,
  Copy,
  Check,
  Share2,
  MoreHorizontal,
  Search,
  Filter,
  TrendingUp,
  Shield,
  Globe,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import type { Collection as CollectionType, NFT } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Collection = () => {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/collections/${slug}`);
        
        if (response.ok) {
          const data = await response.json();
          const apiCollection = data.collection;
          
          setCollection({
            id: apiCollection._id || apiCollection.id,
            name: apiCollection.name,
            slug: apiCollection.slug,
            description: apiCollection.description || '',
            image: apiCollection.image || NFT_PLACEHOLDER,
            banner: apiCollection.banner || '',
            floorPrice: apiCollection.floorPrice || 0,
            totalVolume: apiCollection.totalVolume || 0,
            items: apiCollection.itemCount || 0,
            owners: apiCollection.ownerCount || 0,
            creator: apiCollection.creator,
            verified: apiCollection.isVerified || false,
          });

          const nftsResponse = await fetch(`${API_URL}/collections/${slug}/nfts`);
          if (nftsResponse.ok) {
            const nftsData = await nftsResponse.json();
            const mappedNFTs: NFT[] = nftsData.nfts.map((nft: any) => ({
              id: nft.id,
              tokenId: nft.tokenId || '',
              name: nft.title || '',
              description: nft.description || '',
              image: nft.imageUrl || NFT_PLACEHOLDER,
              price: nft.price || 0,
              currency: nft.currency || 'ETH',
              owner: nft.owner,
              creator: nft.creator,
              collection: {
                id: apiCollection._id || apiCollection.id,
                name: apiCollection.name,
                slug: apiCollection.slug,
                description: apiCollection.description || '',
                image: apiCollection.image || NFT_PLACEHOLDER,
                banner: apiCollection.banner || '',
                floorPrice: apiCollection.floorPrice || 0,
                totalVolume: apiCollection.totalVolume || 0,
                items: apiCollection.itemCount || 0,
                owners: apiCollection.ownerCount || 0,
                creator: apiCollection.creator,
                verified: apiCollection.isVerified || false,
              },
              likes: nft.likes || 0,
              views: nft.views || 0,
              isListed: nft.isListed || false,
              createdAt: nft.createdAt,
              traits: nft.traits || [],
              chain: 'ethereum',
            }));
            setNfts(mappedNFTs);
          }
        } else {
          const foundCollection = mockCollections.find((c) => c.slug === slug);
          if (foundCollection) {
            setCollection(foundCollection);
            const collectionNFTs = mockNFTs.filter(
              (nft) => nft.collection.slug === slug
            );
            setNfts(collectionNFTs);
          }
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        const foundCollection = mockCollections.find((c) => c.slug === slug);
        if (foundCollection) {
          setCollection(foundCollection);
          const collectionNFTs = mockNFTs.filter(
            (nft) => nft.collection.slug === slug
          );
          setNfts(collectionNFTs);
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCollection();
    }
  }, [slug]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredNFTs = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.tokenId.includes(searchQuery)
  );

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.likes - a.likes;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3X3 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Collection not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The collection you're looking for doesn't exist.
          </p>
          <Link to="/explore">
            <Button>Browse Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Banner */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 relative">
        {collection.banner && (
          <img
            src={collection.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Collection Info */}
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Collection Image */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Actions */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {collection.name}
                    </h1>
                    {collection.verified && (
                      <Shield className="w-6 h-6 text-blue-500 fill-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-gray-500 dark:text-gray-400">by</span>
                    <Link
                      to={`/profile/${collection.creator.address}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={collection.creator.avatar}
                        alt={collection.creator.username}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-blue-600 hover:underline font-medium">
                        {collection.creator.username}
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAddress}
                    className="p-3 bg-white dark:bg-slate-900 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 dark:text-gray-300" />
                    )}
                  </button>
                  <button className="p-3 bg-white dark:bg-slate-900 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="w-5 h-5 dark:text-gray-300" />
                  </button>
                  <button className="p-3 bg-white dark:bg-slate-900 border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <MoreHorizontal className="w-5 h-5 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mb-6">{collection.description}</p>

        {/* Social Links */}
        <div className="flex items-center gap-3 mb-6">
          <a
            href="#"
            className="p-2 bg-white dark:bg-slate-900 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="w-5 h-5 dark:text-gray-300" />
          </a>
          <a
            href="#"
            className="p-2 bg-white dark:bg-slate-900 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Twitter className="w-5 h-5 dark:text-gray-300" />
          </a>
          <a
            href="#"
            className="p-2 bg-white dark:bg-slate-900 border rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <MessageCircle className="w-5 h-5 dark:text-gray-300" />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Floor price</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">⬡</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{collection.floorPrice}</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total volume</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">⬡</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(collection.totalVolume)}
              </span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +5.2%
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Items</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(collection.items)}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Total supply</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owners</p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(collection.owners)}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Unique holders</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="mt-8">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 gap-6 dark:border-slate-700">
            <TabsTrigger
              value="items"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none dark:data-[state=active]:text-gray-100"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none dark:data-[state=active]:text-gray-100"
            >
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none dark:data-[state=active]:text-gray-100"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Items Tab */}
          <TabsContent value="items" className="mt-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or trait"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 dark:bg-slate-800 dark:border-slate-700"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-gray-100">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Listed</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* NFT Grid */}
            {sortedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No items found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search to find what you're looking for.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
              <div className="p-4 border-b dark:border-slate-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
              </div>
              <div className="divide-y dark:divide-slate-800">
                {nfts.slice(0, 5).map((nft) => (
                  <div
                    key={nft.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Link to={`/nft/${nft.id}`}>
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </Link>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          <span className="capitalize">sale</span>{' '}
                          <Link
                            to={`/nft/${nft.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {nft.name}
                          </Link>
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          to{' '}
                          <Link
                            to={`/profile/${nft.owner.address}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {nft.owner.username}
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {nft.price} {nft.currency}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">2h ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Floor Price History</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <span className="ml-2 text-gray-400 dark:text-gray-500">Chart coming soon</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Volume History</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <span className="ml-2 text-gray-400 dark:text-gray-500">Chart coming soon</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Owners Distribution</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Users className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <span className="ml-2 text-gray-400 dark:text-gray-500">Chart coming soon</span>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Price Distribution</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                  <span className="ml-2 text-gray-400 dark:text-gray-500">Chart coming soon</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Collection;
