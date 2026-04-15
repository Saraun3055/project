import { Link } from 'react-router-dom';
import { Heart, Verified } from 'lucide-react';
import type { NFT } from '@/types';
import { NFT_PLACEHOLDER } from '@/data/mockData';

interface NFTCardProps {
  nft: NFT;
  showCollection?: boolean;
}

const NFTCard = ({ nft, showCollection = true }: NFTCardProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const collectionSlug = nft.collection.slug || nft.collection.name.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link to={`/nft/${nft.id}`} className="group block">
      <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="aspect-square bg-gray-100 dark:bg-slate-900 relative overflow-hidden">
          <img
            src={nft.image}
            alt={nft.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = NFT_PLACEHOLDER;
            }}
          />
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-700"
          >
            <Heart className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200">
            {nft.chain === 'ethereum' && '⬡ ETH'}
            {nft.chain === 'polygon' && '⬢ MATIC'}
            {nft.chain === 'arbitrum' && '◈ ARB'}
          </div>
        </div>

        <div className="p-4">
          {showCollection && (
            <div className="flex items-center space-x-1 mb-1">
              <span 
                className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/collection/${collectionSlug}`;
                }}
              >
                {nft.collection.name}
              </span>
              {nft.collection.verified && (
                <Verified className="w-3 h-3 text-blue-500 fill-blue-500" />
              )}
            </div>
          )}

          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-2">{nft.name}</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatPrice(nft.price)} {nft.currency}
              </p>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{nft.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
