import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Grid3X3,
  Heart,
  Activity,
  Copy,
  Check,
  Settings,
  Plus,
  Search,
  Filter,
  Image,
  User,
  Verified,
  Wallet,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface NFTData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  currency: string;
  collection: string;
  tokenId: string;
  traits: { trait_type: string; value: string }[];
  createdAt: string;
}

const Profile = () => {
  const { address: urlAddress } = useParams<{ address: string }>();
  const { user: authUser, isAuthenticated, token, linkWallet } = useAuth();
  const { address: walletAddress, isConnected, connect } = useWallet();
  
  const [userNfts, setUserNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('collected');
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);

  useEffect(() => {
    if (urlAddress) {
      const isOwnProfile = authUser?.walletAddress?.toLowerCase() === urlAddress.toLowerCase() ||
                           authUser?.id === urlAddress;
      setIsCurrentUser(isOwnProfile);
      if (isOwnProfile && isAuthenticated) {
        fetchUserNFTs();
      }
    } else if (isAuthenticated && authUser) {
      setIsCurrentUser(true);
      fetchUserNFTs();
    } else if (walletAddress) {
      setIsCurrentUser(true);
    }
  }, [urlAddress, isAuthenticated, authUser, walletAddress]);

  const fetchUserNFTs = async () => {
    if (!authUser?.id || !token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/nfts/user/${authUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserNfts(data.nfts || []);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    const addr = authUser?.walletAddress || walletAddress;
    if (addr) {
      navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkWallet = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    if (!walletAddress) {
      toast.error('No wallet connected');
      return;
    }

    setIsLinkingWallet(true);
    try {
      await linkWallet(walletAddress);
    } catch (error: any) {
      toast.error(error.message || 'Failed to link wallet');
    } finally {
      setIsLinkingWallet(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filterNFTs = (nfts: NFTData[]) => {
    if (!searchQuery) return nfts;
    return nfts.filter(
      (nft) =>
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.collection?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (!isAuthenticated && !walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Sign in to view your profile</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create an account or sign in to see your NFT collection</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login"><Button variant="outline">Sign In</Button></Link>
            <Link to="/signup"><Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const needsWalletLink = isCurrentUser && authUser && !authUser.walletAddress;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
        {authUser?.banner && <img src={authUser.banner} alt="Banner" className="w-full h-full object-cover" />}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 overflow-hidden shadow-lg">
              <img
                src={authUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.username}`}
                alt={authUser?.username}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{authUser?.username || 'New User'}</h1>
                    {authUser?.verified && <Verified className="w-6 h-6 text-blue-500 fill-blue-500" />}
                  </div>
                  {(authUser?.walletAddress || walletAddress) && (
                    <button onClick={handleCopyAddress} className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mt-1">
                      {formatAddress(authUser?.walletAddress || walletAddress || '')}
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isCurrentUser && needsWalletLink && (
                    <Button onClick={handleLinkWallet} disabled={isLinkingWallet} variant="outline" className="gap-2 border-gray-200 dark:border-slate-700">
                      <LinkIcon className="w-4 h-4" />
                      {isLinkingWallet ? 'Linking...' : 'Link Wallet'}
                    </Button>
                  )}
                  
                  {isCurrentUser && authUser?.walletAddress && !isConnected && (
                    <Button onClick={() => connect()} variant="outline" className="gap-2 border-gray-200 dark:border-slate-700">
                      <Wallet className="w-4 h-4" />
                      Connect Wallet
                    </Button>
                  )}
                  
                  {isCurrentUser && (
                    <>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2 border-gray-200 dark:border-slate-700">
                            <Settings className="w-4 h-4" />
                            Settings
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">Profile Settings</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">Username</label>
                              <Input defaultValue={authUser?.username} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-200">Bio</label>
                              <Input defaultValue={authUser?.bio || ''} placeholder="Tell us about yourself" className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100" />
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Link to="/create">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4" />
                          Create
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">{formatNumber(authUser?.followers || 0)}</span>
            <span className="text-gray-500 dark:text-gray-400">followers</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900 dark:text-gray-100">{formatNumber(authUser?.following || 0)}</span>
            <span className="text-gray-500 dark:text-gray-400">following</span>
          </div>
        </div>

        {authUser?.bio && <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl">{authUser.bio}</p>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 dark:border-slate-800 rounded-none h-auto p-0 gap-6">
            <TabsTrigger value="collected" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3 px-1 text-gray-700 dark:text-gray-300 data-[state=active]:text-blue-600">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Created {userNfts.length > 0 && `(${userNfts.length})`}
            </TabsTrigger>
            <TabsTrigger value="favorited" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3 px-1 text-gray-700 dark:text-gray-300 data-[state=active]:text-blue-600">
              <Heart className="w-4 h-4 mr-2" />
              Favorited
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none py-3 px-1 text-gray-700 dark:text-gray-300 data-[state=active]:text-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 py-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400" />
              <Input placeholder="Search by name or collection" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-gray-100" />
            </div>
            <Button variant="outline" className="gap-2 border-gray-200 dark:border-slate-700">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <TabsContent value="collected" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filterNFTs(userNfts).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterNFTs(userNfts).map((nft) => (
                  <div key={nft.id} className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
                    <img src={nft.imageUrl} alt={nft.title} className="w-full aspect-square object-cover" />
                    <div className="p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{nft.collection}</p>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{nft.title}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{nft.price.toFixed(2)} {nft.currency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No NFTs created yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first NFT and share it with the world</p>
                {isCurrentUser && (
                  <Link to="/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">Create NFT</Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorited" className="mt-6">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No favorites yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start exploring and add favorites</p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No activity yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Activity will appear here when you create NFTs</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
