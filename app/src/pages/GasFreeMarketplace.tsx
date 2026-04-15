import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Shield, TrendingUp } from 'lucide-react';

const benefits = [
  { icon: Zap, title: 'Zero Gas Fees', description: 'Mint and trade NFTs without paying any gas fees on supported networks' },
  { icon: Shield, title: 'Secure Transactions', description: 'All transactions are secured by industry-leading protocols' },
  { icon: TrendingUp, title: 'Lower Costs', description: 'Save up to 90% on transaction costs compared to mainnet' },
];

const supportedChains = [
  { name: 'Polygon', logo: '⬡', description: 'Lowest fees, fastest transactions' },
  { name: 'Arbitrum', logo: '🔷', description: 'Ethereum Layer 2 scaling' },
  { name: 'Optimism', logo: '🔴', description: 'Fast and affordable' },
  { name: 'Base', logo: '🔵', description: 'Built by Coinbase' },
];

const GasFreeMarketplace = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Gas-Free Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400">Trade NFTs without worrying about gas fees</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Supported Blockchains</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportedChains.map((chain) => (
                <div key={chain.name} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-3xl">{chain.logo}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{chain.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{chain.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Start Trading Gas-Free</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Connect your wallet and start trading NFTs with zero gas fees</p>
            <Button className="bg-green-600 hover:bg-green-700">Explore Marketplace</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GasFreeMarketplace;