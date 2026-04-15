import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock } from 'lucide-react';

const jobs = [
  { 
    id: 1, 
    title: 'Senior Frontend Engineer', 
    department: 'Engineering', 
    location: 'Remote', 
    type: 'Full-time',
    description: 'Build beautiful, performant user interfaces for our NFT marketplace'
  },
  { 
    id: 2, 
    title: 'Backend Engineer', 
    department: 'Engineering', 
    location: 'Remote', 
    type: 'Full-time',
    description: 'Design and implement scalable APIs and blockchain integrations'
  },
  { 
    id: 3, 
    title: 'Product Designer', 
    department: 'Design', 
    location: 'Remote', 
    type: 'Full-time',
    description: 'Create intuitive and engaging user experiences'
  },
  { 
    id: 4, 
    title: 'DevOps Engineer', 
    department: 'Engineering', 
    location: 'Remote', 
    type: 'Full-time',
    description: 'Manage infrastructure and ensure high availability'
  },
  { 
    id: 5, 
    title: 'Community Manager', 
    department: 'Marketing', 
    location: 'Remote', 
    type: 'Full-time',
    description: 'Engage with our community and support our users'
  },
];

const benefits = [
  'Competitive salary & equity',
  'Remote-first culture',
  'Health, dental & vision insurance',
  'Unlimited PTO',
  'Home office stipend',
  'Learning & development budget',
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Careers</h1>
          <p className="text-gray-500 dark:text-gray-400">Join us in building the future of digital ownership</p>
        </div>

        <Card className="mb-12">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Why Join Nexus?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="text-gray-600 dark:text-gray-400">
                  {benefit}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Open Positions</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{job.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{job.description}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </span>
                  <span>{job.department}</span>
                </div>
                <Button className="mt-4" variant="outline">Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Don't see the right role?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">We're always looking for talented people. Send us your resume.</p>
            <Button variant="outline">Send Resume</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Careers;