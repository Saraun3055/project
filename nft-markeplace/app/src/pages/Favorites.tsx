import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import NFTCard from '@/components/NFTCard';
import { Button } from '@/components/ui/button';
import type { NFT } from '@/types';
import { NFT_PLACEHOLDER } from '@/data/mockData';
import { Heart, Grid3X3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Favorites = () => {
  const { token, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/nfts/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          const mappedNFTs: NFT[] = data.nfts.map((nft: any) => ({
            id: nft.id,
            tokenId: nft.tokenId || '',
            name: nft.title || '',
            description: nft.description || '',
            image: nft.imageUrl || NFT_PLACEHOLDER,
            price: nft.price || 0,
            currency: nft.currency || 'ETH',
            owner: nft.owner ? {
              id: nft.owner._id || nft.owner.id,
              address: nft.owner.walletAddress || '',
              username: nft.owner.username || 'Unknown',
              avatar: nft.owner.avatar || NFT_PLACEHOLDER,
              bio: nft.owner.bio || '',
              verified: nft.owner.verified || false,
              followers: 0,
              following: 0,
            } : nft.creator,
            creator: nft.creator ? {
              id: nft.creator._id || nft.creator.id,
              address: nft.creator.walletAddress || '',
              username: nft.creator.username || 'Unknown',
              avatar: nft.creator.avatar || NFT_PLACEHOLDER,
              bio: nft.creator.bio || '',
              verified: nft.creator.verified || false,
              followers: 0,
              following: 0,
            } : nft.creator,
            collection: {
              id: '',
              name: nft.collection || 'Unnamed',
              slug: (nft.collection || 'unnamed').toLowerCase().replace(/\s+/g, '-'),
              description: '',
              image: NFT_PLACEHOLDER,
              banner: '',
              floorPrice: 0,
              totalVolume: 0,
              items: 0,
              owners: 0,
              creator: nft.creator,
              verified: false,
            },
            likes: nft.likes || 0,
            views: nft.views || 0,
            isListed: nft.isListed || false,
            createdAt: nft.createdAt,
            traits: nft.traits || [],
            chain: 'ethereum',
          }));

          setFavorites(mappedNFTs);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sign in to view favorites
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You need to be logged in to see your favorite NFTs.
          </p>
          <Link to="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Favorites</h1>
        
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Grid3X3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No favorites yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start exploring and save your favorite NFTs!
            </p>
            <Link to="/explore">
              <Button>Explore NFTs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
