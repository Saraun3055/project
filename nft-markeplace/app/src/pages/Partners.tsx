import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const partners = [
  { name: 'OpenSea', description: 'Leading NFT marketplace', logo: '🟦' },
  { name: 'MetaMask', description: 'Crypto wallet', logo: '🦊' },
  { name: 'Polygon', description: 'Layer 2 blockchain', logo: '⬡' },
  { name: 'Infura', description: 'Blockchain infrastructure', logo: '⚡' },
  { name: 'Alchemy', description: 'Web3 development platform', logo: '🔮' },
  { name: 'CoinGecko', description: 'Crypto price tracking', logo: '📊' },
];

const Partners = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Partners</h1>
          <p className="text-gray-500 dark:text-gray-400">Trusted partners powering the Nexus ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {partners.map((partner) => (
            <Card key={partner.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{partner.logo}</div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{partner.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{partner.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Become a Partner</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              We're always looking for innovative partners to join our ecosystem. 
              Contact us to learn more about partnership opportunities.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">Apply Now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Partners;