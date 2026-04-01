import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ArrowRight } from 'lucide-react';

const blogPosts = [
  { id: 1, title: 'The Future of NFTs: 2025 Trends', date: '2025-03-20', excerpt: 'Discover the latest trends shaping the NFT landscape in 2025', category: 'Industry' },
  { id: 2, title: 'How to Spot Fake NFTs', date: '2025-03-15', excerpt: 'Learn how to identify and avoid counterfeit NFTs', category: 'Guide' },
  { id: 3, title: 'Introducing Gas-Free Trading', date: '2025-03-10', excerpt: 'Trade NFTs on Polygon with zero gas fees', category: 'Product' },
  { id: 4, title: 'Top 10 NFT Collections in 2025', date: '2025-03-05', excerpt: 'Our curated list of the hottest NFT collections', category: 'Features' },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Blog</h1>
          <p className="text-gray-500 dark:text-gray-400">Latest news, updates, and insights from Nexus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">{post.category}</span>
                  <span>•</span>
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{post.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{post.excerpt}</p>
                <Button variant="ghost" className="p-0">
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;