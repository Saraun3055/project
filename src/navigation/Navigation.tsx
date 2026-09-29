import React, { createContext, useContext, useState } from 'react';

export type ScreenName = 'splash' | 'welcome' | 'login' | 'register' | 'home' | 'menu' | 'restaurants' | 'details' | 'cart' | 'checkout' | 'profile' | 'editProfile' | 'address' | 'tracking' | 'feedback' | 'restaurantLogin' | 'restaurantDashboard';

interface NavigationContextType {
  currentScreen: ScreenName;
  currentParams: any;
  history: ScreenName[];
  drawerOpen: boolean;
  navigate: (screenName: ScreenName, params?: any) => void;
  goBack: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('splash');
  const [currentParams, setCurrentParams] = useState<any>(null);
  const [history, setHistory] = useState<ScreenName[]>(['splash']);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = (screenName: ScreenName, params?: any) => {
    setCurrentScreen(screenName);
    setCurrentParams(params || null);
    setHistory((prev) => [...prev, screenName]);
    setDrawerOpen(false);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const nextHistory = [...prev];
      nextHistory.pop(); // Remove current screen
      const prevScreen = nextHistory[nextHistory.length - 1];
      setCurrentScreen(prevScreen);
      setCurrentParams(null); // clear params on back for simpler logic
      return nextHistory;
    });
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        currentParams,
        history,
        drawerOpen,
        navigate,
        goBack,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

