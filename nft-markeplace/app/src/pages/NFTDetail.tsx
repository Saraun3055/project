import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockNFTs, mockActivities, NFT_PLACEHOLDER } from '@/data/mockData';
import { useWallet } from '@/context/WalletContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import NFTCard from '@/components/NFTCard';
import {
  Heart,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Tag,
  History,
  Info,
  Grid3X3,
  ChevronLeft,
  Wallet,
  Shield,
  Zap,
  ArrowRightLeft,
} from 'lucide-react';
import type { NFT } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NFTDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, connect } = useWallet();
  const { user: authUser, token } = useAuth();
  const [nft, setNft] = useState<NFT | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showListDialog, setShowListDialog] = useState(false);
  const [listPrice, setListPrice] = useState('');

  useEffect(() => {
    const fetchNFT = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/nfts/${id}`);
        if (response.ok) {
          const data = await response.json();
          const apiNFT = data.nft;
          
          const mappedNFT: NFT = {
            id: apiNFT.id,
            tokenId: apiNFT.tokenId || '',
            name: apiNFT.title || '',
            description: apiNFT.description || '',
            image: apiNFT.imageUrl || NFT_PLACEHOLDER,
            price: apiNFT.price || 0,
            currency: apiNFT.currency || 'ETH',
            owner: apiNFT.owner ? {
              id: apiNFT.owner._id || apiNFT.owner.id,
              address: apiNFT.owner.walletAddress || '',
              username: apiNFT.owner.username || 'Unknown',
              avatar: apiNFT.owner.avatar || NFT_PLACEHOLDER,
              bio: apiNFT.owner.bio || '',
              verified: apiNFT.owner.verified || false,
              followers: apiNFT.owner.followers || 0,
              following: apiNFT.owner.following || 0,
            } : apiNFT.creator,
            creator: apiNFT.creator ? {
              id: apiNFT.creator._id || apiNFT.creator.id,
              address: apiNFT.creator.walletAddress || '',
              username: apiNFT.creator.username || 'Unknown',
              avatar: apiNFT.creator.avatar || NFT_PLACEHOLDER,
              bio: apiNFT.creator.bio || '',
              verified: apiNFT.creator.verified || false,
              followers: apiNFT.creator.followers || 0,
              following: apiNFT.creator.following || 0,
            } : apiNFT.creator,
            collection: {
              id: '',
              name: apiNFT.collection || 'Unnamed Collection',
              slug: (apiNFT.collection || 'unnamed').toLowerCase().replace(/\s+/g, '-'),
              description: '',
              image: NFT_PLACEHOLDER,
              banner: '',
              floorPrice: 0,
              totalVolume: 0,
              items: 0,
              owners: 0,
              creator: apiNFT.creator,
              verified: false,
            },
            likes: apiNFT.likes || 0,
            views: apiNFT.views || 0,
            isListed: apiNFT.isListed || false,
            createdAt: apiNFT.createdAt,
            traits: apiNFT.traits || [],
            chain: apiNFT.blockchain || 'ethereum',
          };
          setNft(mappedNFT);
        } else {
          const foundNFT = mockNFTs.find((n) => n.id === id);
          if (foundNFT) {
            setNft(foundNFT);
          }
        }
      } catch (error) {
        console.error('Error fetching NFT:', error);
        const foundNFT = mockNFTs.find((n) => n.id === id);
        if (foundNFT) {
          setNft(foundNFT);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNFT();
    }
  }, [id]);

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }
    setShowBuyDialog(true);
  };

  const handleConfirmBuy = async () => {
    if (!token || !nft) return;
    
    try {
      const response = await fetch(`${API_URL}/transactions/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nftId: nft.id,
          price: nft.price,
          currency: nft.currency
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`NFT purchased successfully!\nTransaction: ${data.transactionHash.slice(0, 10)}...`);
        setShowBuyDialog(false);
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to purchase NFT');
      }
    } catch (error) {
      console.error('Buy error:', error);
      alert('Error purchasing NFT');
    }
  };

  const handleMakeOffer = () => {
    if (!isConnected) {
      connect();
      return;
    }
    if (!token) {
      navigate('/login');
      return;
    }
    setShowOfferDialog(true);
  };

  const handleConfirmOffer = async () => {
    if (!token || !nft || !offerAmount) return;
    
    try {
      const response = await fetch(`${API_URL}/transactions/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nftId: nft.id,
          price: parseFloat(offerAmount),
          currency: 'ETH',
          expiresIn: 7
        })
      });

      if (response.ok) {
        alert('Offer submitted successfully!');
        setShowOfferDialog(false);
        setOfferAmount('');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to submit offer');
      }
    } catch (error) {
      console.error('Offer error:', error);
      alert('Error submitting offer');
    }
  };

  const handleToggleLike = async () => {
    if (!token || !nft) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/nfts/${nft.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setNft(prev => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleListForSale = async () => {
    if (!token || !nft || !listPrice) return;
    
    try {
      const response = await fetch(`${API_URL}/transactions/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nftId: nft.id,
          price: parseFloat(listPrice),
          currency: 'ETH'
        })
      });

      if (response.ok) {
        alert('NFT listed successfully!');
        setShowListDialog(false);
        setListPrice('');
        window.location.reload();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to list NFT');
      }
    } catch (error) {
      console.error('List error:', error);
      alert('Error listing NFT');
    }
  };

  const isOwner = authUser && nft && (
    nft.owner?.id === authUser.id || 
    nft.owner?.address === authUser.walletAddress
  );

  const relatedNFTs = mockNFTs
    .filter((n) => n.collection.id === nft?.collection.id && n.id !== nft?.id)
    .slice(0, 4);

  const nftActivities = mockActivities.filter((a) => a.nft.id === id);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading NFT...
          </h2>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3X3 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            NFT not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The NFT you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/explore')}>
            Browse NFTs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            {/* Image Card */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl overflow-hidden border shadow-sm dark:border-slate-800">
              <div className="p-4 border-b flex items-center justify-between dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Chain:</span>
                  <span className="flex items-center gap-1 text-sm font-medium">
                    ⬡ Ethereum
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleLike}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                    />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="aspect-square bg-gray-100">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Attributes Accordion */}
            <Accordion type="single" collapsible defaultValue="attributes">
              <AccordionItem value="attributes" className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Properties</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {nft.traits.map((trait, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-center hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
                      >
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-medium mb-1">
                          {trait.trait_type}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {trait.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Details Accordion */}
            <Accordion type="single" collapsible defaultValue="details">
              <AccordionItem value="details" className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Contract Address</span>
                      <button
                        onClick={() =>
                          handleCopyAddress('0x1234567890abcdef1234567890abcdef12345678')
                        }
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {formatAddress('0x1234567890abcdef1234567890abcdef12345678')}
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Token ID</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{nft.tokenId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Token Standard</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">ERC-721</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Chain</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Ethereum</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(nft.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Creator Earnings</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">5%</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-4">
            {/* Collection & Name */}
            <div>
              <Link
                to={`/collection/${nft.collection.slug}`}
                className="flex items-center gap-2 text-blue-600 hover:underline mb-2"
              >
                {nft.collection.verified && (
                  <Shield className="w-4 h-4 text-blue-500" />
                )}
                <span className="font-medium">{nft.collection.name}</span>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{nft.name}</h1>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {nft.views.toLocaleString()} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {nft.likes + (isLiked ? 1 : 0)} favorites
                </span>
              </div>
            </div>

            {/* Owner & Creator */}
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owned by</p>
                <Link
                  to={`/profile/${nft.owner?.address || ''}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={nft.owner?.avatar || NFT_PLACEHOLDER}
                    alt={nft.owner?.username || 'Unknown'}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {nft.owner?.username || 'Unknown'}
                  </span>
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created by</p>
                <Link
                  to={`/profile/${nft.creator?.address || ''}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={nft.creator?.avatar || NFT_PLACEHOLDER}
                    alt={nft.creator?.username || 'Unknown'}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {nft.creator?.username || 'Unknown'}
                  </span>
                </Link>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-white dark:bg-slate-950 rounded-xl border dark:border-slate-800 p-6">
              {nft.isListed ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current price</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {nft.price} {nft.currency}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      (${(nft.price * 2500).toLocaleString()})
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Not listed for sale</p>
              )}
              <div className="flex gap-3">
                {isOwner ? (
                  <Button
                    onClick={() => setShowListDialog(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                  >
                    <Tag className="w-5 h-5 mr-2" />
                    {nft.isListed ? 'Update Price' : 'List for Sale'}
                  </Button>
                ) : (
                  <>
                    {nft.isListed && (
                      <Button
                        onClick={handleBuy}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        Buy now
                      </Button>
                    )}
                    <Button
                      onClick={handleMakeOffer}
                      variant="outline"
                      className="flex-1 py-6 text-lg font-semibold dark:border-slate-700 dark:text-gray-100"
                    >
                      <Tag className="w-5 h-5 mr-2" />
                      Make offer
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{nft.description}</p>
              <Link
                to={`/collection/${nft.collection.slug}`}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mt-3"
              >
                See collection
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Price History / Listings / Offers Tabs */}
            <Tabs defaultValue="listings" className="bg-white dark:bg-slate-900 rounded-xl border dark:border-slate-800">
              <TabsList className="w-full justify-start rounded-t-xl border-b bg-transparent p-0 dark:border-slate-700">
                <TabsTrigger
                  value="listings"
                  className="rounded-none rounded-tl-xl px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none dark:data-[state=active]:text-gray-100"
                >
                  Listings
                </TabsTrigger>
                <TabsTrigger
                  value="offers"
                  className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none dark:data-[state=active]:text-gray-100"
                >
                  Offers
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none px-6 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none dark:data-[state=active]:text-gray-100"
                >
                  Activity
                </TabsTrigger>
              </TabsList>
              <TabsContent value="listings" className="p-4 m-0">
                <div className="flex items-center justify-between py-3 border-b last:border-0 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{nft.price} ETH</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">by {nft.owner.username}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={handleBuy}>
                    Buy
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="offers" className="p-4 m-0">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p>No offers yet</p>
                  <Button
                    variant="outline"
                    className="mt-3 dark:border-slate-700 dark:text-gray-100"
                    onClick={handleMakeOffer}
                  >
                    Make an offer
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="history" className="m-0">
                {nftActivities.length > 0 ? (
                  <div className="divide-y dark:divide-slate-800">
                    {nftActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            {activity.type === 'sale' && (
                              <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                            {activity.type === 'listing' && (
                              <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                            {activity.type === 'mint' && (
                              <Grid3X3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{activity.type}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              from{' '}
                              <Link
                                to={`/profile/${activity.from.address}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {activity.from.username}
                              </Link>{' '}
                              to{' '}
                              <Link
                                to={`/profile/${activity.to.address}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {activity.to.username}
                              </Link>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {activity.price > 0 && (
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {activity.price} {activity.currency}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <History className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No activity yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* More from this Collection */}
        {relatedNFTs.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                More from this collection
              </h2>
              <Link
                to={`/collection/${nft.collection.slug}`}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View collection
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedNFTs.map((relatedNft) => (
                <NFTCard key={relatedNft.id} nft={relatedNft} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Buy Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete checkout</DialogTitle>
            <DialogDescription>
              You are about to purchase {nft.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{nft.collection.name}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{nft.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Item price</span>
                <span className="text-gray-900 dark:text-gray-100">{nft.price} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Service fee</span>
                <span className="text-gray-900 dark:text-gray-100">0.005 ETH</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t dark:border-slate-700">
                <span className="text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-gray-900 dark:text-gray-100">{(nft.price + 0.005).toFixed(3)} ETH</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowBuyDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleConfirmBuy}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Make Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make an offer</DialogTitle>
            <DialogDescription>
              Enter your offer amount for {nft.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">Price</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="pr-16 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  ETH
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ≈ ${offerAmount ? (parseFloat(offerAmount) * 2500).toLocaleString() : '0.00'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your offer will be active for 7 days. The owner can accept it at any time.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowOfferDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!offerAmount || parseFloat(offerAmount) <= 0}
              onClick={handleConfirmOffer}
            >
              Make offer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List for Sale Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>List NFT for Sale</DialogTitle>
            <DialogDescription>
              Set a price for {nft.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-900 dark:text-gray-100">Price (ETH)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {listPrice ? `≈ $${(parseFloat(listPrice) * 2500).toLocaleString()}` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowListDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!listPrice || parseFloat(listPrice) <= 0}
              onClick={handleListForSale}
            >
              List NFT
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NFTDetail;
