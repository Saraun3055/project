import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOKEN_KEY = 'FOOD_EXPRESS_JWT_TOKEN';

let inMemoryToken: string | null = null;

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    inMemoryToken = storedToken || null;
    return inMemoryToken;
  } catch {
    return inMemoryToken;
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  inMemoryToken = token;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    return;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  inMemoryToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
};
