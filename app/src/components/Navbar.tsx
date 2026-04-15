import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Wallet,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Heart,
  Settings,
  LogIn,
  UserPlus,
  ChevronDown,
  Shield,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected, connect } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', href: '/explore' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img src="/nexus_logo_transparent.png" alt="Nexus" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Nexus
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
              <Input
                type="text"
                placeholder="Search items, collections, and accounts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-900 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>
          </form>

          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-900"
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-900"
                >
                  Create
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-900">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{user?.username}</span>
                      <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800">
                    <div className="px-3 py-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user?.username}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-800" />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-gray-100">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')} className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-gray-100">
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-gray-100">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-800" />
                        <DropdownMenuItem onClick={() => navigate('/admin')} className="text-purple-600 dark:text-purple-400 focus:bg-gray-100 dark:focus:bg-slate-800">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {!user?.walletAddress && (
                      <>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-800" />
                        <DropdownMenuItem onClick={() => connect()} className="text-blue-600 dark:text-blue-400 focus:bg-gray-100 dark:focus:bg-slate-800">
                          <Wallet className="w-4 h-4 mr-2" />
                          Link Wallet
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {user?.walletAddress && !isConnected && (
                      <>
                        <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-800" />
                        <DropdownMenuItem onClick={() => connect()} className="text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-800 focus:text-gray-900 dark:focus:text-gray-100">
                          <Wallet className="w-4 h-4 mr-2" />
                          Connect Wallet
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator className="bg-gray-200 dark:bg-slate-800" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            <div className="ml-2">
              <ThemeToggle />
            </div>

            <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900" asChild>
              <Link to="/notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Link>
            </Button>
          </div>

          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-slate-800">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-900 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>
            </form>

            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/explore"
                className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
