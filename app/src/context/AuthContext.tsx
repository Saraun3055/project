import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  banner?: string;
  walletAddress?: string | null;
  verified: boolean;
  followers?: number;
  following?: number;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  linkWallet: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchUser(storedToken);
      } else {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('nexus_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('nexus_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(data.message || 'Login failed');
    }

    const data = await response.json();

    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success('Welcome back!');
    return data.user;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Signup failed' }));
      throw new Error(data.message || 'Signup failed');
    }

    const data = await response.json();

    localStorage.setItem('nexus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success('Account created successfully!');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('nexus_token');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  const updateProfile = useCallback(async (userData: Partial<User>) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    setUser(data.user);
    return data.user;
  }, [token]);

  const linkWallet = useCallback(async (walletAddress: string) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/auth/link-wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ walletAddress })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to link wallet');
    }

    setUser(prev => prev ? { ...prev, walletAddress } : null);
    toast.success('Wallet linked successfully!');
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        updateProfile,
        linkWallet
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
