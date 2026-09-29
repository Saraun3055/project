import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  user: 'foodexpress:user',
  cart: 'foodexpress:cart',
  selectedCuisine: 'foodexpress:selectedCuisine',
  searchQuery: 'foodexpress:searchQuery',
  flaggedDeals: 'foodexpress:flaggedDeals',
  dishRatings: 'foodexpress:dishRatings',
  favoriteDishes: 'foodexpress:favorites',
  theme: 'foodexpress:theme',
  recentSearches: 'foodexpress:recentSearches',
  deliveryPreferences: 'foodexpress:deliveryPreferences',
  healthMeter: 'foodexpress:healthMeter',
  appliedCoupon: 'foodexpress:appliedCoupon',
  userProfile: 'foodexpress:userProfile',
  userAddresses: 'foodexpress:userAddresses',
  pastOrders: 'foodexpress:pastOrders',
};

export const getStoredJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const rawValue = await AsyncStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch (error) {
    console.warn(`Storage read failed for ${key}:`, error);
    return fallback;
  }
};

export const saveStoredJson = async <T>(key: string, value: T): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Storage write failed for ${key}:`, error);
  }
};

export const clearSessionStorage = async (): Promise<void> => {
  const sessionKeys = [
    STORAGE_KEYS.user,
    STORAGE_KEYS.userProfile,
    STORAGE_KEYS.userAddresses,
    STORAGE_KEYS.pastOrders,
    STORAGE_KEYS.cart,
    STORAGE_KEYS.selectedCuisine,
    STORAGE_KEYS.searchQuery,
    STORAGE_KEYS.flaggedDeals,
    STORAGE_KEYS.dishRatings,
    STORAGE_KEYS.favoriteDishes,
    STORAGE_KEYS.recentSearches,
    STORAGE_KEYS.appliedCoupon,
    STORAGE_KEYS.healthMeter,
  ];

  try {
    await Promise.all(sessionKeys.map(key => AsyncStorage.removeItem(key)));
  } catch (error) {
    console.warn('Session storage clear failed:', error);
  }
};

