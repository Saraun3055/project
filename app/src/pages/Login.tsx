import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Wallet, Loader2, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser: any = await login(email, password);
      
      if (loginType === 'admin') {
        if (loggedInUser?.role === 'admin') {
          navigate('/admin');
        } else {
          setError('You do not have admin access');
          return;
        }
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <img src="/nexus_logo_transparent.png" alt="Nexus" className="w-12 h-12 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nexus
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {loginType === 'admin' ? 'Admin Login' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {loginType === 'admin' 
                ? 'Sign in to the admin panel' 
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="flex rounded-lg bg-gray-100 dark:bg-slate-800 p-1 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('user')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginType === 'user'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              User Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                loginType === 'admin'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 font-medium ${
                loginType === 'admin'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {loginType === 'user' && (
          <>
            <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400">or continue with</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Web3 Wallet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connect via MetaMask or similar</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Already have an account? Your wallet can be linked after signing in.
            </p>
            <Button
              variant="outline"
              className="w-full h-10 border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => navigate('/')}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Continue with Wallet
            </Button>
          </div>
          </>
          )}

          <p className="mt-6 text-center text-gray-500 dark:text-gray-400">
            {loginType === 'admin' ? (
              <>
                <Link to="/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium">
                  Switch to User Login
                </Link>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                  Sign up
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
