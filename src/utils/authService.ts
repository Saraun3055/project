/**
 * Simulated JWT Authentication Service for Experiment 6.
 * Uses AsyncStorage to persist a fake JWT token.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/foodApi';

// base64 helpers available in the RN runtime (Hermes) but not in some TS lib configs
declare const btoa: (input: string) => string;
declare const atob: (input: string) => string;

const TOKEN_KEY = 'FOOD_EXPRESS_JWT_TOKEN';

// Fallback storage for environments where native AsyncStorage is null (e.g. missing native build)
let inMemoryToken: string | null = null;

const getAuthToken = async (): Promise<string | null> => {
  try {
    const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
    inMemoryToken = storedToken || null;
    return inMemoryToken;
  } catch {
    return inMemoryToken;
  }
};

const setAuthToken = async (token: string): Promise<void> => {
  inMemoryToken = token;
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {
    return;
  }
};

const removeAuthToken = async (): Promise<void> => {
  inMemoryToken = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
};

interface DecodedToken {
  email: string;
  iat: number;
  exp: number;
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const encodedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (encodedPayload.length % 4)) % 4;
    const payload = JSON.parse(atob(`${encodedPayload}${'='.repeat(padding)}`)) as Partial<DecodedToken>;

    if (typeof payload.email !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }

    return payload as DecodedToken;
  } catch {
    return null;
  }
};

/**
 * Simulates a JWT login.
 * Accepts any valid email + password that passes strength requirements.
 * Generates a fake JWT-like token and stores it.
 */
export const simulateLogin = async (email: string, _password: string): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    // Simulate server delay
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));

    const now = Date.now();
    const normalizedEmail = email.trim().toLowerCase();
    const payload: DecodedToken = {
      email: normalizedEmail,
      iat: now,
      exp: now + 24 * 60 * 60 * 1000,
    };

    // Encode as base64 to mimic a JWT structure (header.payload.signature)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = btoa(`simulated-signature-${now}`);
    const token = `${header}.${body}.${signature}`;

    // Store the token
    await setAuthToken(token);

    console.log('[AuthService] JWT token generated and stored successfully.');
    return { success: true, token };
  } catch (error) {
    console.error('[AuthService] Login failed:', error);
    return { success: false, error: 'Authentication failed. Please try again.' };
  }
};

/**
 * Reads the stored token and checks its validity.
 * Returns the decoded user info if valid, or null if expired/missing.
 */
export const getStoredToken = async (): Promise<{ email: string } | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('[AuthService] No stored token found.');
      return null;
    }

    const payload = decodeToken(token);
    if (!payload) {
      console.log('[AuthService] Invalid token format.');
      await removeAuthToken();
      return null;
    }

    if (Date.now() > payload.exp) {
      console.log('[AuthService] Token has expired. Clearing session.');
      await removeAuthToken();
      return null;
    }

    console.log('[AuthService] Valid session found for:', payload.email);
    return { email: payload.email };
  } catch {
    console.warn('[AuthService] Unable to restore the stored session.');
    return null;
  }
};

/**
 * Removes the stored JWT token (logout).
 */
export const simulateLogout = async (): Promise<void> => {
  try {
    await removeAuthToken();
    console.log('[AuthService] Token cleared. User logged out.');
  } catch (error) {
    console.error('[AuthService] Error during logout:', error);
  }
};

const RESTAURANT_SESSION_KEY = 'FOOD_EXPRESS_RESTAURANT_SESSION';

export interface RestaurantSession {
  token: string;
  restaurantId: string;
  email: string;
  name?: string;
  expiresAt: number;
}

let inMemoryRestaurantSession: RestaurantSession | null = null;

const removeRestaurantSession = async (): Promise<void> => {
  inMemoryRestaurantSession = null;
  try {
    await AsyncStorage.removeItem(RESTAURANT_SESSION_KEY);
  } catch {
    return;
  }
};

const saveRestaurantSession = async (session: RestaurantSession): Promise<void> => {
  inMemoryRestaurantSession = session;
  try {
    await AsyncStorage.setItem(RESTAURANT_SESSION_KEY, JSON.stringify(session));
  } catch {
    return;
  }
};

export const getStoredRestaurantSession = async (): Promise<RestaurantSession | null> => {
  try {
    const raw = await AsyncStorage.getItem(RESTAURANT_SESSION_KEY);
    if (!raw) {
      inMemoryRestaurantSession = null;
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<RestaurantSession>;
    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.restaurantId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now()
    ) {
      await removeRestaurantSession();
      return null;
    }

    const session = parsed as RestaurantSession;
    inMemoryRestaurantSession = session;
    return session;
  } catch {
    return inMemoryRestaurantSession;
  }
};

export const loginRestaurant = async (
  email: string,
  password: string,
): Promise<{ success: boolean; session?: RestaurantSession; error?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: 'Restaurant email and password are required.' };
  }

  try {
    const { data } = await apiClient.post('/auth/restaurant/login', {
      email: normalizedEmail,
      password,
    }, { timeout: 4000 });
    const restaurant = data?.restaurant;
    if (!data?.token || !restaurant?.id) {
      return { success: false, error: 'Restaurant authentication failed.' };
    }

    const session: RestaurantSession = {
      token: data.token,
      restaurantId: restaurant.id,
      email: String(restaurant.email || normalizedEmail).trim().toLowerCase(),
      name: restaurant.name,
      expiresAt: Date.now() + (Number(data.expiresInSeconds) || 12 * 60 * 60) * 1000,
    };
    await saveRestaurantSession(session);
    return { success: true, session };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { error?: string } } };
    if (apiError.response) {
      return {
        success: false,
        error: apiError.response.data?.error || 'Incorrect restaurant email or password.',
      };
    }

    return {
      success: false,
      error: 'Unable to reach the restaurant service. Please try again.',
    };
  }
};

export const restaurantLogout = async (): Promise<void> => {
  await removeRestaurantSession();
};
