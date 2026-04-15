import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-200 dark:text-slate-800 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" className="gap-2">
              <Search className="w-4 h-4" />
              Explore NFTs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;