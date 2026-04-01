import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Newsletter</h1>
          <p className="text-gray-500 dark:text-gray-400">Stay updated with the latest news and updates</p>
        </div>

        {!subscribed ? (
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-6">
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Subscribe
                </Button>
              </form>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-xl mx-auto">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Successfully Subscribed!</h3>
              <p className="text-gray-500 dark:text-gray-400">Thank you for subscribing to our newsletter.</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Weekly Updates</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Get weekly roundups of new collections and trending NFTs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Market Insights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Stay informed about market trends and opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Exclusive Drops</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to know about upcoming NFT drops</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;