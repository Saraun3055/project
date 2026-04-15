import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, ShoppingCart, Heart, TrendingUp, AlertCircle } from 'lucide-react';

const notifications = [
  { id: 1, type: 'sale', title: 'NFT Sold!', message: 'Your "Cosmic Dreams #42" was sold for 2.5 ETH', time: '5 min ago', read: false },
  { id: 2, type: 'offer', title: 'New Offer', message: 'Someone offered 1.5 ETH for your "Abstract Art #7"', time: '1 hour ago', read: false },
  { id: 3, type: 'like', title: 'New Like', message: 'Your NFT "Digital Horizon" received 10 new likes', time: '2 hours ago', read: true },
  { id: 4, type: 'price', title: 'Price Alert', message: 'Bored Ape Yacht Club floor price increased by 15%', time: '3 hours ago', read: true },
  { id: 5, type: 'system', title: 'Welcome to Nexus', message: 'Start exploring and collecting NFTs today!', time: '1 day ago', read: true },
];

const Notifications = () => {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'offer': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'price': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Notifications</h1>
            <p className="text-gray-500 dark:text-gray-400">Stay updated on your NFT activity</p>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'unread' ? 'default' : 'outline'} 
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
        </div>

        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No notifications</h3>
                <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifs.map((notif) => (
              <Card 
                key={notif.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${!notif.read ? 'border-blue-500 dark:border-blue-400' : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="mt-1">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{notif.title}</h3>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{notif.message}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{notif.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;