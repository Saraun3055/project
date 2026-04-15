import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories, chains, mockNFTs } from '@/data/mockData';
import NFTCard from '@/components/NFTCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  LayoutList, 
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { NFT } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedChain, setSelectedChain] = useState(searchParams.get('chain') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [status, setStatus] = useState<'all' | 'buy-now' | 'auction'>('all');

  const fetchNFTs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/nfts/explore?limit=100`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.nfts?.length > 0) {
          const mappedNFTs: NFT[] = data.nfts.map((nft: any, index: number) => ({
            id: nft.id,
            tokenId: nft.tokenId || String(index + 1),
            name: nft.title,
            description: nft.description || '',
            image: nft.imageUrl,
            price: nft.price || Math.random() * 10 + 0.1,
            currency: nft.currency || 'ETH',
            owner: nft.creator || { id: '1', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', username: 'CryptoKing', avatar: '', verified: true, followers: 12500, following: 450 },
            creator: nft.creator || { id: '1', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', username: 'CryptoKing', avatar: '', verified: true, followers: 12500, following: 450 },
            collection: {
              id: nft.collection?.id || '1',
              name: nft.collection || 'Collection',
              slug: (nft.collection || 'collection').toLowerCase().replace(/\s+/g, '-'),
              description: '',
              image: nft.imageUrl || '',
              banner: '',
              floorPrice: nft.price || 1,
              totalVolume: 0,
              items: 0,
              owners: 0,
              creator: { id: '1', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', username: 'CryptoKing', avatar: '', verified: true, followers: 12500, following: 450 },
              verified: false,
            },
            likes: Math.floor(Math.random() * 500),
            views: Math.floor(Math.random() * 5000),
            isListed: true,
            createdAt: nft.createdAt || new Date().toISOString(),
            traits: nft.traits?.map((t: any) => ({ trait_type: t.trait_type, value: t.value })) || [],
            chain: nft.blockchain || 'ethereum',
          }));
          setNfts(mappedNFTs);
        } else {
          setNfts(mockNFTs);
        }
      } else {
        setNfts(mockNFTs);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setNfts(mockNFTs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const filteredNFTs = useMemo(() => {
    let filtered = [...nfts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (nft) =>
          nft.name.toLowerCase().includes(query) ||
          nft.collection.name.toLowerCase().includes(query) ||
          nft.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((nft) => 
        nft.collection.name.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedChain !== 'all') {
      filtered = filtered.filter((nft) => nft.chain === selectedChain);
    }

    filtered = filtered.filter(
      (nft) => nft.price >= priceRange[0] && nft.price <= priceRange[1]
    );

    if (status === 'buy-now') {
      filtered = filtered.filter((nft) => nft.isListed);
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [nfts, searchQuery, selectedCategory, selectedChain, priceRange, status, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchQuery);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedChain('all');
    setPriceRange([0, 100]);
    setStatus('all');
    setSortBy('recent');
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedCategory !== 'all' || 
    selectedChain !== 'all' || 
    priceRange[0] > 0 || 
    priceRange[1] < 100 ||
    status !== 'all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search items, collections, and accounts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-900 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 border-gray-200 dark:border-slate-700 ${showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
                  <SelectItem value="recent">Recently Listed</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchNFTs} className="border-gray-200 dark:border-slate-700">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              <div className="flex border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-900'}`}
                >
                  <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-slate-800' : 'hover:bg-gray-50 dark:hover:bg-slate-900'}`}
                >
                  <LayoutList className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {showFilters && (
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-4 sticky top-40">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <Accordion type="multiple" defaultValue={['status', 'price', 'chains']}>
                  <AccordionItem value="status">
                    <AccordionTrigger className="text-gray-700 dark:text-gray-200">Status</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {['All', 'Buy Now', 'On Auction'].map((s) => (
                          <label key={s} className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
                            <Checkbox
                              checked={status === s.toLowerCase().replace(' ', '-')}
                              onCheckedChange={() => setStatus(s.toLowerCase().replace(' ', '-') as any)}
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger className="text-gray-700 dark:text-gray-200">Price</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          max={100}
                          step={1}
                        />
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{priceRange[0]} ETH</span>
                          <span>{priceRange[1]} ETH</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="chains">
                    <AccordionTrigger className="text-gray-700 dark:text-gray-200">Chains</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
                          <Checkbox checked={selectedChain === 'all'} onCheckedChange={() => setSelectedChain('all')} />
                          <span>All Chains</span>
                        </label>
                        {chains.map((chain) => (
                          <label key={chain.id} className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
                            <Checkbox checked={selectedChain === chain.id} onCheckedChange={() => setSelectedChain(chain.id)} />
                            <span>{chain.icon} {chain.name}</span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-gray-700 dark:text-gray-200">Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
                          <Checkbox checked={selectedCategory === 'all'} onCheckedChange={() => setSelectedCategory('all')} />
                          <span>All Categories</span>
                        </label>
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-200">
                            <Checkbox checked={selectedCategory === category.id} onCheckedChange={() => setSelectedCategory(category.id)} />
                            <span>{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : `${filteredNFTs.length} ${filteredNFTs.length === 1 ? 'result' : 'results'}`}
                {searchQuery && <span className="ml-2">for "{searchQuery}"</span>}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No items found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700">Clear all filters</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
