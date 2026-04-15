import { Link } from 'react-router-dom';
import { Verified } from 'lucide-react';
import type { Collection } from '@/types';

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard = ({ collection }: CollectionCardProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Link to={`/collection/${collection.slug}`} className="group block">
      <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {collection.banner && (
            <img
              src={collection.banner}
              alt={`${collection.name} banner`}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="relative -mt-10 mb-3">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 shadow-md">
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=C';
                }}
              />
            </div>
          </div>

          {/* Name */}
          <div className="flex items-center space-x-1 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{collection.name}</h3>
            {collection.verified && (
              <Verified className="w-4 h-4 text-blue-500 fill-blue-500 flex-shrink-0" />
            )}
          </div>

          {/* Creator */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            by <span className="text-blue-600 dark:text-blue-400">{collection.creator.username}</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-slate-800">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Floor</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatPrice(collection.floorPrice)} ETH</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatNumber(collection.totalVolume)} ETH</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatNumber(collection.items)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
