import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Code, Wallet, Image, ShoppingCart, Shield } from 'lucide-react';

const docsSections = [
  { icon: Wallet, title: 'Getting Started', description: 'Set up your wallet and start trading' },
  { icon: Image, title: 'Creating NFTs', description: 'Learn how to mint your own NFTs' },
  { icon: ShoppingCart, title: 'Buying & Selling', description: 'Complete guide to trading NFTs' },
  { icon: Shield, title: 'Security', description: 'Keep your assets safe' },
  { icon: Code, title: 'API Reference', description: 'Developer documentation' },
];

const Docs = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Documentation</h1>
          <p className="text-gray-500 dark:text-gray-400">Everything you need to know about Nexus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docsSections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{section.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Start Guide</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Get up and running in 5 minutes</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Connect your wallet (MetaMask recommended)</li>
              <li>Add funds to your wallet (ETH or MATIC)</li>
              <li>Browse the marketplace and find an NFT you like</li>
              <li>Click Buy and confirm the transaction</li>
              <li>View your new NFT in your profile</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Docs;