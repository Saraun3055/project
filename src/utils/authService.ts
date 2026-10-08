import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/foodApi';
import { getAuthToken, setAuthToken, removeAuthToken, TOKEN_KEY } from './tokenStorage';

export { getAuthToken, setAuthToken, removeAuthToken, TOKEN_KEY };

// base64 helpers available in the RN runtime (Hermes) but not in some TS lib configs
declare const btoa: (input: string) => string;
declare const atob: (input: string) => string;

interface DecodedToken {
  email?: string;
  sub?: string;
  iat?: number;
  exp?: number;
}

const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const encodedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (encodedPayload.length % 4)) % 4;
    const rawString = atob(`${encodedPayload}${'='.repeat(padding)}`);
    const payload = JSON.parse(rawString) as Partial<DecodedToken>;

    const email = payload.email || (payload.sub && payload.sub.includes('@') ? payload.sub : undefined);
    if (!email && typeof payload.sub !== 'string') {
      return null;
    }

    return payload as DecodedToken;
  } catch {
    return null;
  }
};

/**
 * Real or simulated customer registration with live MongoDB backend.
 */
export const registerCustomer = async (
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const { data } = await apiClient.post('/auth/register', {
      name,
      email: normalizedEmail,
      password,
      phone,
    });
    if (data?.token) {
      await setAuthToken(data.token);
      console.log('[AuthService] Backend registration succeeded. JWT stored.');
      return { success: true, token: data.token };
    }
  } catch (error: any) {
    const apiError = error?.response?.data?.error;
    if (apiError) {
      return { success: false, error: apiError };
    }
    console.warn('[AuthService] Live backend unreachable during registration, falling back to local simulation:', error);
  }

  // Fallback to local session
  return simulateLogin(normalizedEmail, password);
};

/**
 * Authenticates customer with real backend JWT service, falling back to simulated session.
 */
export const simulateLogin = async (
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> => {
  const normalizedEmail = email.trim().toLowerCase();

  // Try live backend first
  try {
    const { data } = await apiClient.post('/auth/login', {
      email: normalizedEmail,
      password,
    });
    if (data?.token) {
      await setAuthToken(data.token);
      console.log('[AuthService] Live backend JWT login succeeded.');
      return { success: true, token: data.token };
    }
  } catch (error: any) {
    const apiError = error?.response?.data?.error;
    if (apiError) {
      // Reject if explicit auth failure from backend
      return { success: false, error: apiError };
    }
    console.warn('[AuthService] Live backend login unreachable, falling back to local simulation:', error);
  }

  try {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));

    const now = Date.now();
    const payload: DecodedToken = {
      email: normalizedEmail,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + 24 * 60 * 60 * 1000) / 1000),
    };

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = btoa(`simulated-signature-${now}`);
    const token = `${header}.${body}.${signature}`;

    await setAuthToken(token);
    console.log('[AuthService] Fallback JWT token generated and stored.');
    return { success: true, token };
  } catch (error) {
    console.error('[AuthService] Fallback login failed:', error);
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
      return null;
    }

    const payload = decodeToken(token);
    if (!payload) {
      console.log('[AuthService] Invalid token format.');
      await removeAuthToken();
      return null;
    }

    if (payload.exp && Date.now() > payload.exp * 1000) {
      console.log('[AuthService] Token has expired. Clearing session.');
      await removeAuthToken();
      return null;
    }

    const userEmail = payload.email || (payload.sub && payload.sub.includes('@') ? payload.sub : 'user@foodexpress.in');
    return { email: userEmail };
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
