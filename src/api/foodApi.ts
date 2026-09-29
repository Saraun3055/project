import axios from 'axios';
import { Platform } from 'react-native';
import { CUISINES, DISHES, RESTAURANTS, Dish, Restaurant, COUPONS, Coupon } from '../data/mockData';

export interface PromoBanner {
  id: string;
  title: string;
  message: string;
  cta: string;
  accentColor: string;
}

export interface RemoteProfile {
  email: string;
  name: string;
  phone: string;
  address: string;
}

export interface RestaurantFromApi {
  id: string;
  name: string;
  location?: string;
  cuisine?: string;
  rating?: number;
  deliveryTime?: string;
  minimumOrder?: number;
  coverImage?: string;
  description?: string;
  tags?: string[];
}

export interface LinkItem {
  dishId: string;
  restaurantId?: string;
  restaurantName?: string;
  name?: string;
  price?: number;
  quantity?: number;
}

export interface CouponResult {
  coupon: Pick<Coupon, 'id' | 'code' | 'description'> | null;
  discount: number;
  finalTotal: number;
}

export interface HomeApiState {
  dishes: Dish[];
  categories: string[];
  promoBanner: PromoBanner;
  profile: RemoteProfile;
}

// Base URL for the FoodExpress Express backend.
// - Android emulator reaches the host machine via 10.0.2.2.
// - iOS simulator and web builds can use localhost.
// - For a physical device, replace with your machine's LAN IP,
//   e.g. http://192.168.x.x:3001/api
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001/api'
    : 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    Accept: 'application/json',
  },
});

const fallbackProfile: RemoteProfile = {
  email: 'aarav@foodexpress.in',
  name: 'Aarav Sharma',
  phone: '+91 98765 43210',
  address: 'Flat 402, Springdale Apartments, Indiranagar, Bengaluru - 560038',
};

const getFallbackProfile = (email?: string): RemoteProfile => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return fallbackProfile;

  return {
    email: normalizedEmail,
    name: normalizedEmail.split('@')[0] || fallbackProfile.name,
    phone: fallbackProfile.phone,
    address: fallbackProfile.address,
  };
};

const fallbackBanner: PromoBanner = {
  id: 'banner-1',
  title: 'Fresh Picks Today',
  message: 'Enjoy chef-curated meals and free delivery on your first order.',
  cta: 'Order now',
  accentColor: '#FF5200',
};

const palette = ['#FFE8D6', '#E8F5E9', '#FFF8E1', '#FFE5EC', '#ECEFF1'];

const mapCuisineEmoji = (cuisine: Dish['cuisine']): string => {
  const lookup: Record<Dish['cuisine'], string> = {
    Indian: '🍛',
    Chinese: '🥢',
    Italian: '🍕',
    'Fast Food': '🍔',
    Desserts: '🍰',
  };
  return lookup[cuisine] || '🍽️';
};

const isLikelyVeg = (dish: any): boolean => {
  const name = String(dish.name || '').toLowerCase();
  const vegKeywords = [
    'paneer', 'fries', 'dim sum', 'veg', 'poha', 'idli', 'dosa', 'pongal',
    'sambar', 'chocolate', 'mango', 'panna cotta', 'cake', 'dessert',
    'margherita', 'arrabbiata', 'noodles',
  ];
  const nonVegKeywords = ['chicken', 'mutton', 'fish', 'egg', 'kebab', 'beef', 'bacon'];
  if (nonVegKeywords.some((word) => name.includes(word))) return false;
  return (
    vegKeywords.some((word) => name.includes(word)) ||
    (dish.isVeg !== undefined ? Boolean(dish.isVeg) : true)
  );
};

const normalizeDish = (dish: any, index: number): Dish => {
  const cuisine = (CUISINES.includes(dish.cuisine) ? dish.cuisine : 'Indian') as Dish['cuisine'];
  const healthScore = Number(dish.healthMeterScore ?? 60);
  const rating = Number(dish.rating ?? 4.5) || 4.5;
  const isFlashDeal = index % 3 === 0;
  return {
    id: dish.id ?? `api-${index + 1}`,
    name: dish.name ?? `Chef Special ${index + 1}`,
    cuisine,
    description: dish.description ?? 'Freshly prepared for a flavorful dining experience.',
    spiceLevel: dish.spiceLevel ?? 'Medium',
    price: Number(dish.price ?? 249) || 249,
    rating,
    deliveryTime: dish.deliveryTime ?? `${20 + (index % 4) * 6}-${30 + (index % 4) * 7} mins`,
    cravingScore: Math.min(100, Math.round(rating * 18 + (index % 4) * 9)),
    healthScore: Math.min(100, healthScore),
    color: palette[index % palette.length],
    emoji: mapCuisineEmoji(cuisine),
    imageUrl: dish.imageUrl ?? 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    restaurantName: dish.restaurantName ?? 'FoodExpress Kitchen',
    restaurantId: dish.restaurantId ?? 'api_rest_',
    isVeg: isLikelyVeg(dish),
    isFlashDeal,
    discountPercent: isFlashDeal ? 15 + (index % 4) * 5 : undefined,
  };
};

const normalizeRestaurant = (restaurant: any, index: number): Restaurant => {
  const cuisine = (CUISINES.includes(restaurant.cuisine) ? restaurant.cuisine : 'Indian') as Restaurant['cuisine'];
  return {
    id: restaurant.id ?? `api-rest-${index + 1}`,
    name: restaurant.name ?? `Restaurant ${index + 1}`,
    cuisine,
    rating: Number(restaurant.rating ?? 4.5) || 4.5,
    deliveryTime: restaurant.deliveryTime ?? `${20 + (index % 4) * 5}-${30 + (index % 4) * 6} mins`,
    minimumOrder: Number(restaurant.minimumOrder ?? 99) || 99,
    coverImage: restaurant.coverImage ?? 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
    description: restaurant.description ?? restaurant.location ?? 'Delicious food, delivered hot.',
    tags: Array.isArray(restaurant.tags) ? restaurant.tags : [],
  };
};

export const sanitizeCategoryList = (categories: unknown[]): string[] => {
  const cleaned = categories
    .map((category) =>
      typeof category === 'string'
        ? category.trim()
        : category && typeof category === 'object'
          ? String((category as Record<string, unknown>).name ?? '')
          : ''
    )
    .filter((category) => category && CUISINES.includes(category as (typeof CUISINES)[number]));
  return cleaned.length ? [...new Set(cleaned)] : [...CUISINES];
};

// ---------------------------------------------------------------------------
// Fetch() based services: Restaurants, Dishes, Categories
// ---------------------------------------------------------------------------

export const getRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`);
    if (!response.ok) throw new Error('Restaurant request failed.');
    const json = await response.json();
    const raw = Array.isArray(json?.restaurants) ? json.restaurants : [];
    return raw.length ? raw.map(normalizeRestaurant) : RESTAURANTS;
  } catch (error) {
    console.warn('Using fallback restaurants because the live API was unavailable:', error);
    return RESTAURANTS;
  }
};

export const getDishes = async (restaurantId?: string): Promise<Dish[]> => {
  try {
    const url = restaurantId
      ? `${API_BASE_URL}/dishes?restaurantId=${encodeURIComponent(restaurantId)}`
      : `${API_BASE_URL}/dishes`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Dish request failed.');
    const json = await response.json();
    const raw = Array.isArray(json?.dishes) ? json.dishes : [];
    return raw.length ? raw.map(normalizeDish) : DISHES;
  } catch (error) {
    console.warn('Using fallback dishes because the live API was unavailable:', error);
    return restaurantId
      ? DISHES.filter((dish) => dish.restaurantId === restaurantId)
      : DISHES;
  }
};

export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Category request failed.');
    const json = await response.json();
    const raw = Array.isArray(json?.categories) ? json.categories : [];
    return raw.length ? sanitizeCategoryList(raw) : [...CUISINES];
  } catch (error) {
    console.warn('Using fallback categories because the live API was unavailable:', error);
    return [...CUISINES];
  }
};

// ---------------------------------------------------------------------------
// Axios based services: Profile, Promotions, Coupon calculation
// ---------------------------------------------------------------------------

export const getUserProfile = async (email?: string): Promise<RemoteProfile> => {
  const fallback = getFallbackProfile(email);
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    const { data } = await apiClient.get('/users/profile', normalizedEmail ? { params: { email: normalizedEmail } } : undefined);
    const profile = data?.profile;
    const profileEmail = typeof profile?.email === 'string' ? profile.email.trim().toLowerCase() : '';
    const profileMatches = !normalizedEmail || profileEmail === normalizedEmail;

    if (!profile || !profileMatches) {
      return fallback;
    }

    return {
      email: normalizedEmail || profileEmail || fallback.email,
      name: profile.name || fallback.name,
      phone: profile.phone || fallback.phone,
      address: profile.address || fallback.address,
    };
  } catch (error) {
    console.warn('Using fallback profile data because the live API was unavailable:', error);
    return fallback;
  }
};

export const getPromotions = async (): Promise<PromoBanner[]> => {
  try {
    const { data } = await apiClient.get('/promotions');
    const promotions = Array.isArray(data?.promotions) ? data.promotions : [];
    return promotions.map((promo: any) => ({
      id: String(promo?.id ?? 'banner-1'),
      title: promo?.title ?? fallbackBanner.title,
      message: promo?.message ?? fallbackBanner.message,
      cta: promo?.cta ?? 'Explore deals',
      accentColor: promo?.accentColor ?? '#FF5200',
    }));
  } catch (error) {
    console.warn('Using fallback promo banner because the live API was unavailable:', error);
    return [fallbackBanner];
  }
};

export const calculateBestCoupon = async (cartPayload: {
  items: LinkItem[];
  subtotal: number;
  deliveryFee: number;
}): Promise<CouponResult> => {
  try {
    const { data } = await apiClient.post('/cart/apply-coupon', cartPayload);
    return {
      coupon: data?.coupon ?? null,
      discount: Number(data?.discount ?? 0),
      finalTotal: Number(data?.finalTotal ?? 0),
    };
  } catch (error) {
    console.warn('Using local coupon logic because the coupon API was unavailable:', error);
    const subtotal = Number(cartPayload.subtotal) || 0;
    const deliveryFee = Number(cartPayload.deliveryFee) || 0;
    let bestCoupon: Pick<Coupon, 'id' | 'code' | 'description'> | null = null;
    let discount = 0;
    COUPONS.forEach((coupon) => {
      if (subtotal < coupon.minOrderValue) return;
      let candidate = 0;
      if (coupon.discountType === 'flat') {
        candidate = coupon.discountValue;
      } else if (coupon.discountType === 'percent') {
        candidate = Math.round((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount && candidate > coupon.maxDiscount) {
          candidate = coupon.maxDiscount;
        }
      } else if (coupon.discountType === 'free_delivery') {
        candidate = deliveryFee;
      }
      if (candidate > discount) {
        discount = candidate;
        bestCoupon = { id: coupon.id, code: coupon.code, description: coupon.description };
      }
    });
    return { coupon: bestCoupon, discount, finalTotal: subtotal + deliveryFee - discount };
  }
};

export const syncCartToServer = async (items: LinkItem[]) => {
  try {
    await apiClient.put('/cart', { items });
    return true;
  } catch (error) {
    console.warn('Cart sync to server failed:', error);
    return false;
  }
};

// ---------------------------------------------------------------------------
// Aggregated loaders used by screens (kept for backward compatibility)
// ---------------------------------------------------------------------------

export const fetchDishAndCategoryData = async (): Promise<HomeApiState> => {
  try {
    const [dishes, categories, promotions] = await Promise.all([
      getDishes(),
      getCategories(),
      getPromotions(),
    ]);
    return {
      dishes,
      categories,
      promoBanner: promotions[0] ?? fallbackBanner,
      profile: fallbackProfile,
    };
  } catch (error) {
    console.warn('Using fallback food data:', error);
    return {
      dishes: DISHES,
      categories: [...CUISINES],
      promoBanner: fallbackBanner,
      profile: fallbackProfile,
    };
  }
};

export const fetchProfileData = async (email?: string): Promise<RemoteProfile> => {
  return getUserProfile(email);
};

export const fetchPromoBanner = async (): Promise<PromoBanner> => {
  const promotions = await getPromotions();
  return promotions[0] ?? fallbackBanner;
};