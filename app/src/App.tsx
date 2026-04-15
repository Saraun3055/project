import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { ThemeProvider } from '@/context/ThemeContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Explore from '@/pages/Explore';
import NFTDetail from '@/pages/NFTDetail';
import Profile from '@/pages/Profile';
import Create from '@/pages/Create';
import Collection from '@/pages/Collection';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Settings from '@/pages/Settings';
import Favorites from '@/pages/Favorites';
import NotFound from '@/pages/NotFound';
import Admin from '@/pages/Admin';
import Watchlist from '@/pages/Watchlist';
import MyCollections from '@/pages/MyCollections';
import HelpCenter from '@/pages/HelpCenter';
import PlatformStatus from '@/pages/PlatformStatus';
import Partners from '@/pages/Partners';
import GasFreeMarketplace from '@/pages/GasFreeMarketplace';
import Taxes from '@/pages/Taxes';
import Blog from '@/pages/Blog';
import Docs from '@/pages/Docs';
import Newsletter from '@/pages/Newsletter';
import About from '@/pages/About';
import Careers from '@/pages/Careers';
import Ventures from '@/pages/Ventures';
import Grants from '@/pages/Grants';
import Notifications from '@/pages/Notifications';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/nft/:id" element={<NFTDetail />} />
          <Route path="/collection/:slug" element={<Collection />} />
          
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRoute>
                <Signup />
              </AuthRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:address" element={<Profile />} />
          
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/collections" element={<MyCollections />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/status" element={<PlatformStatus />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/gas-free" element={<GasFreeMarketplace />} />
          <Route path="/taxes" element={<Taxes />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/ventures" element={<Ventures />} />
          <Route path="/grants" element={<Grants />} />
          <Route path="/notifications" element={<Notifications />} />
          
          <Route path="*" element={<NotFound />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WalletProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster position="top-right" />
        </WalletProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
