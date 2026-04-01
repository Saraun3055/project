import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Lightbulb, Users } from 'lucide-react';

const programs = [
  {
    id: 1,
    title: 'Creator Grant',
    amount: '$5,000 - $50,000',
    description: 'Funding for artists and creators building in the NFT space',
    icon: Award,
  },
  {
    id: 2,
    title: 'Developer Grant',
    amount: '$10,000 - $100,000',
    description: 'Support for developers building tools and infrastructure',
    icon: Lightbulb,
  },
  {
    id: 3,
    title: 'Community Grant',
    amount: '$1,000 - $10,000',
    description: 'Funding for community-driven projects and initiatives',
    icon: Users,
  },
];

const pastRecipients = [
  'Digital Artist Collective',
  'NFT Gaming Studio',
  'Web3 Infrastructure Project',
  'Charity NFT Platform',
  'Education Initiative',
];

const Grants = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nexus Grants</h1>
          <p className="text-gray-500 dark:text-gray-400">Empowering innovation in the NFT ecosystem</p>
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The Nexus Grants program supports innovators, creators, and developers building the future of the NFT ecosystem. 
              We provide funding, mentorship, and resources to help successful applicants bring their vision to life.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Since launching in 2024, we've awarded over $2M in grants to hundreds of projects worldwide.
            </p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Grant Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <program.icon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{program.title}</h3>
                <p className="text-green-600 font-semibold text-sm mb-2">{program.amount}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{program.description}</p>
                <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Submit your application with project details and goals</li>
              <li>Our team reviews applications on a rolling basis</li>
              <li>If selected, you'll receive funding and mentorship</li>
              <li>Share your progress and contribute to the ecosystem</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Past Recipients</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Projects that have received Nexus Grants</p>
            <div className="flex flex-wrap gap-2">
              {pastRecipients.map((recipient) => (
                <span key={recipient} className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  {recipient}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Grants;