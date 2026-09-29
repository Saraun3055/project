import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { fetchProfileData } from '../api/foodApi';
import { getStoredToken } from '../utils/authService';
import { getStoredJson, saveStoredJson, STORAGE_KEYS } from '../utils/storage';

export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  address: string;
}

interface UserContextType {
  user: UserProfile | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  email: 'user@foodexpress.com',
  name: 'Food Explorer',
  phone: '+91 98765 43210',
  address: 'Flat 402, Springdale Apartments, Indiranagar, Bengaluru - 560038',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const authOperationRef = useRef(0);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const restoreUser = async () => {
      const operation = authOperationRef.current;
      const session = await getStoredToken();
      const savedUser = await getStoredJson<UserProfile | null>(STORAGE_KEYS.user, null);
      const isSameAccount = Boolean(
        session &&
        savedUser &&
        savedUser.email.trim().toLowerCase() === session.email.trim().toLowerCase()
      );

      if (isMounted && operation === authOperationRef.current) {
        isHydratedRef.current = true;
        setUser(isSameAccount ? savedUser : null);
      }
    };

    restoreUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (user) {
      saveStoredJson(STORAGE_KEYS.user, user);
    } else {
      saveStoredJson(STORAGE_KEYS.user, null);
    }
  }, [user]);

  const login = async (email: string) => {
    const operation = authOperationRef.current + 1;
    authOperationRef.current = operation;
    const normalizedEmail = email.trim().toLowerCase();
    const savedUser = await getStoredJson<UserProfile | null>(STORAGE_KEYS.user, null);
    const savedProfile = savedUser && savedUser.email.trim().toLowerCase() === normalizedEmail
      ? savedUser
      : null;
    const remoteProfile = await fetchProfileData(normalizedEmail);
    const nextUser: UserProfile = {
      email: normalizedEmail,
      name: savedProfile?.name || remoteProfile.name || remoteProfile.email.split('@')[0] || normalizedEmail,
      phone: savedProfile?.phone || remoteProfile.phone || defaultProfile.phone,
      address: savedProfile?.address || remoteProfile.address || defaultProfile.address,
    };

    if (operation === authOperationRef.current) {
      isHydratedRef.current = true;
      setUser(nextUser);
    }
  };

  const logout = async () => {
    authOperationRef.current += 1;
    isHydratedRef.current = true;
    await saveStoredJson(STORAGE_KEYS.user, null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
