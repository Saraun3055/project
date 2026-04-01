import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Globe, Rocket } from 'lucide-react';

const portfolio = [
  { name: 'Polygon', logo: '⬡', description: 'Layer 2 scaling solution' },
  { name: 'Arbitrum', logo: '🔷', description: 'Ethereum Layer 2' },
  { name: 'Optimism', logo: '🔴', description: 'Optimistic Rollup' },
  { name: 'Base', logo: '🔵', description: 'Coinbase L2' },
];

const Ventures = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nexus Ventures</h1>
          <p className="text-gray-500 dark:text-gray-400">Investing in the future of Web3</p>
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nexus Ventures is our investment arm dedicated to supporting innovative projects in the Web3 space. 
              We believe in empowering creators, developers, and entrepreneurs who are building the next generation of decentralized applications.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our portfolio includes leading projects in blockchain infrastructure, DeFi, gaming, and digital art.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Our Focus Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="p-6">
              <Globe className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Infrastructure</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Supporting projects that improve blockchain scalability and usability</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Users className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Creator Economy</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Investing in platforms that empower creators and artists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Rocket className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Gaming & Metaverse</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Supporting innovative gaming and virtual world projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">DeFi</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Funding projects that democratize finance</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portfolio.map((company) => (
            <Card key={company.name}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-3xl">{company.logo}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{company.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{company.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ventures;