import { Card, CardContent } from '@/components/ui/card';
import { Users, Globe, Shield, Rocket } from 'lucide-react';

const stats = [
  { value: '2M+', label: 'Active Users' },
  { value: '500K+', label: 'NFTs Listed' },
  { value: '$1B+', label: 'Volume Traded' },
  { value: '50+', label: 'Blockchains Supported' },
];

const values = [
  { icon: Globe, title: 'Global Access', description: 'Making NFTs accessible to everyone, everywhere' },
  { icon: Shield, title: 'Security First', description: 'Protecting user assets with industry-leading security' },
  { icon: Rocket, title: 'Innovation', description: 'Continuously improving the NFT experience' },
  { icon: Users, title: 'Community', description: 'Building a vibrant, inclusive NFT community' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">About Nexus</h1>
          <p className="text-gray-500 dark:text-gray-400">The world's most trusted NFT marketplace</p>
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nexus is the world's first and largest digital marketplace for crypto collectibles and non-fungible tokens (NFTs). 
              We believe in the power of digital ownership and want to make it accessible to everyone.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Founded in 2023, we've grown to serve millions of users worldwide, enabling creators to monetize their work 
              and collectors to own unique digital assets.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our mission is to build the future of digital ownership, one NFT at a time.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value) => (
            <Card key={value.title}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;