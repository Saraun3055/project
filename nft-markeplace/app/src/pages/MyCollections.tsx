import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen, Image } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MyCollections = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [collections] = useState<any[]>([]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sign in to view your collections</h2>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Collections</h1>
            <p className="text-gray-500 dark:text-gray-400">Create and manage your NFT collections</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Collection
          </Button>
        </div>

        {collections.length === 0 ? (
          <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No collections yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first collection to organize your NFTs</p>
            <Button>Create Collection</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gray-100 dark:bg-slate-800 rounded-t-xl overflow-hidden">
                  {collection.bannerUrl ? (
                    <img src={collection.bannerUrl} alt={collection.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{collection.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{collection.nftCount} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCollections;