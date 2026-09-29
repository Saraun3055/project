import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { Dish, COUPONS, Coupon } from '../data/mockData';
import { calculateBestCoupon } from '../api/foodApi';
import { getStoredJson, saveStoredJson, STORAGE_KEYS } from '../utils/storage';

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface RestaurantCartGroup {
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
}

export interface DeliveryPreferences {
  deliveryMode: 'delivery' | 'pickup';
  notes: string;
  saveAddress: boolean;
}

export interface PlacedOrder {
  id: string;
  groups: RestaurantCartGroup[];
  grandTotal: number;
  placedAt: string;
  estimatedDelivery: string;
  status: 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
}

interface CartContextType {
  cartItems: CartItem[];
  restaurantGroups: RestaurantCartGroup[];
  restaurantCount: number;
  subTotal: number;
  deliveryFee: number;
  grandTotal: number;
  bestCoupon: Coupon | null;
  discountAmount: number;
  finalTotal: number;
  pastOrders: PlacedOrder[];
  addPlacedOrder: (order: PlacedOrder) => void;
  cancelPlacedOrder: (orderId: string) => void;
  flaggedDeals: string[];
  selectedCuisine: string | null;
  setSelectedCuisine: (cuisine: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dishRatings: Record<string, number>;
  rateDish: (dishId: string, rating: number) => void;
  favoriteDishIds: string[];
  toggleFavorite: (dishId: string) => void;
  clearFavorites: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  theme: 'light' | 'dark';
  setTheme: (value: 'light' | 'dark') => void;
  deliveryPreferences: DeliveryPreferences;
  setDeliveryPreferences: (preferences: DeliveryPreferences) => void;
  addToCart: (dish: Dish) => void;
  updateQuantity: (dishId: string, delta: number) => void;
  clearCart: () => void;
  resetSessionState: () => void;
  toggleFlashDealFlag: (dish: Dish) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function buildRestaurantGroups(items: CartItem[]): RestaurantCartGroup[] {
  const map: Record<string, RestaurantCartGroup> = {};
  items.forEach(item => {
    const rid = item.dish.restaurantId;
    if (!map[rid]) {
      map[rid] = {
        restaurantId: rid,
        restaurantName: item.dish.restaurantName,
        items: [],
        subtotal: 0,
      };
    }
    map[rid].items.push(item);
    map[rid].subtotal += item.dish.price * item.quantity;
  });
  return Object.values(map);
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pastOrders, setPastOrders] = useState<PlacedOrder[]>([]);
  const [flaggedDeals, setFlaggedDeals] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dishRatings, setDishRatings] = useState<Record<string, number>>({});
  const [favoriteDishIds, setFavoriteDishIds] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [deliveryPreferences, setDeliveryPreferencesState] = useState<DeliveryPreferences>({
    deliveryMode: 'delivery',
    notes: 'Add extra napkins and cutlery.',
    saveAddress: true,
  });
const [lastFlaggedAction, setLastFlaggedAction] = useState<{ dishName: string; isFlagged: boolean } | null>(null);
  const [couponCache, setCouponCache] = useState<{ coupon: Coupon | null; discount: number }>({ coupon: null, discount: 0 });
  const isHydratedRef = useRef(false);
  const hydrationVersionRef = useRef(0);
  const searchInteractionRef = useRef(false);

  const updateSearchQuery = (query: string) => {
    searchInteractionRef.current = true;
    setSearchQuery(query);
  };

  useEffect(() => {
    let isMounted = true;
    const version = hydrationVersionRef.current;

    const hydrateCartState = async () => {
      const savedCart = await getStoredJson<CartItem[]>(STORAGE_KEYS.cart, []);
      const savedOrders = await getStoredJson<PlacedOrder[]>(STORAGE_KEYS.pastOrders, []);
      const savedFlaggedDeals = await getStoredJson<string[]>(STORAGE_KEYS.flaggedDeals, []);
      const savedCuisine = await getStoredJson<string | null>(STORAGE_KEYS.selectedCuisine, null);
      const savedSearchQuery = await getStoredJson<string>(STORAGE_KEYS.searchQuery, '');
      const savedRatings = await getStoredJson<Record<string, number>>(STORAGE_KEYS.dishRatings, {});
      const savedFavorites = await getStoredJson<string[]>(STORAGE_KEYS.favoriteDishes, []);
      const savedRecentSearches = await getStoredJson<string[]>(STORAGE_KEYS.recentSearches, []);
      const savedTheme = await getStoredJson<'light' | 'dark'>(STORAGE_KEYS.theme, 'light');
      const savedDeliveryPreferences = await getStoredJson<DeliveryPreferences>(STORAGE_KEYS.deliveryPreferences, {
        deliveryMode: 'delivery',
        notes: 'Add extra napkins and cutlery.',
        saveAddress: true,
      });
      const savedCoupon = await getStoredJson<{ coupon: Coupon | null; discount: number }>(STORAGE_KEYS.appliedCoupon, { coupon: null, discount: 0 });

      if (!isMounted || version !== hydrationVersionRef.current) return;
      isHydratedRef.current = true;
      setCartItems(savedCart);
      setPastOrders(savedOrders);
       setFlaggedDeals(savedFlaggedDeals);
       setSelectedCuisine(savedCuisine);
       if (!searchInteractionRef.current) setSearchQuery(savedSearchQuery);
       setDishRatings(savedRatings);
      setFavoriteDishIds(savedFavorites);
      setRecentSearches(savedRecentSearches);
      setThemeState(savedTheme);
      setDeliveryPreferencesState(savedDeliveryPreferences);
      setCouponCache(savedCoupon);
    };

    hydrateCartState().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.cart, cartItems);
  }, [cartItems]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.pastOrders, pastOrders);
  }, [pastOrders]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.flaggedDeals, flaggedDeals);
  }, [flaggedDeals]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.selectedCuisine, selectedCuisine);
  }, [selectedCuisine]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.searchQuery, searchQuery);
  }, [searchQuery]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.dishRatings, dishRatings);
  }, [dishRatings]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.favoriteDishes, favoriteDishIds);
  }, [favoriteDishIds]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.recentSearches, recentSearches);
  }, [recentSearches]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.theme, theme);
  }, [theme]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.deliveryPreferences, deliveryPreferences);
  }, [deliveryPreferences]);
  useEffect(() => {
    if (isHydratedRef.current) saveStoredJson(STORAGE_KEYS.appliedCoupon, couponCache);
  }, [couponCache]);

  useEffect(() => {
    if (lastFlaggedAction) {
      Alert.alert(
        '⚡ Flash Deal Update',
        `"${lastFlaggedAction.dishName}" has been ${lastFlaggedAction.isFlagged ? 'FLAGGED as a special Deal!' : 'UNFLAGGED from Special Deals.'}`
      );
      setLastFlaggedAction(null);
    }
  }, [lastFlaggedAction]);

  const restaurantGroups = buildRestaurantGroups(cartItems);
  const restaurantCount = restaurantGroups.length;
  const subTotal = restaurantGroups.reduce((sum, g) => sum + g.subtotal, 0);
  const deliveryFee = restaurantCount > 0 ? restaurantCount * 40 : 0;
  const grandTotal = subTotal + deliveryFee;

  let bestCoupon: Coupon | null = null;
  let discountAmount = 0;

  if (subTotal > 0) {
    COUPONS.forEach(coupon => {
if (subTotal >= coupon.minOrderValue) {
          let discount = 0;
        if (coupon.discountType === 'flat') {
          discount = coupon.discountValue;
        } else if (coupon.discountType === 'percent') {
          discount = Math.round((subTotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.discountType === 'free_delivery') {
          discount = deliveryFee;
        }

        if (discount > discountAmount) {
          discountAmount = discount;
          bestCoupon = coupon;
        }
      }
    });
  }

  // Synchronize coupon calculation with the backend: whenever the cart or its
  // totals change, ask the API for the best valid coupon automatically.
  useEffect(() => {
    if (subTotal <= 0) {
      setCouponCache({ coupon: null, discount: 0 });
      return;
    }
    let cancelled = false;
    calculateBestCoupon({
      items: cartItems.map((item) => ({
        dishId: item.dish.id,
        restaurantId: item.dish.restaurantId,
        restaurantName: item.dish.restaurantName,
        name: item.dish.name,
        price: item.dish.price,
        quantity: item.quantity,
      })),
      subtotal: subTotal,
      deliveryFee,
    })
      .then((result) => {
        if (cancelled) return;
        const coupon = result.coupon
          ? COUPONS.find((c) => c.code === result.coupon?.code) ?? null
          : null;
        setCouponCache({ coupon, discount: result.discount });
      })
      .catch(() => {
        if (cancelled) return;
        setCouponCache({ coupon: bestCoupon, discount: discountAmount });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, subTotal, deliveryFee]);

  // Prefer the freshly calculated server coupon when it still qualifies.
  if (couponCache.coupon && subTotal >= couponCache.coupon.minOrderValue) {
    bestCoupon = couponCache.coupon;
    discountAmount = couponCache.discount;
  }

  const finalTotal = grandTotal - discountAmount;

  const addPlacedOrder = (order: PlacedOrder) => {
    setPastOrders(prev => [order, ...prev]);
  };

  const cancelPlacedOrder = (orderId: string) => {
    setPastOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o)
    );
  };

  const addToCart = (dish: Dish) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => (item.dish.id === dishId ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const resetSessionState = () => {
    hydrationVersionRef.current += 1;
    isHydratedRef.current = true;
    setCartItems([]);
    setPastOrders([]);
    setFlaggedDeals([]);
     setSelectedCuisine(null);
     searchInteractionRef.current = false;
     setSearchQuery('');
    setDishRatings({});
    setFavoriteDishIds([]);
    setRecentSearches([]);
    setCouponCache({ coupon: null, discount: 0 });
    setLastFlaggedAction(null);
  };

  const toggleFlashDealFlag = (dish: Dish) => {
    setFlaggedDeals(prev => {
      const isAlreadyFlagged = prev.includes(dish.id);
      setLastFlaggedAction({ dishName: dish.name, isFlagged: !isAlreadyFlagged });
      return isAlreadyFlagged ? prev.filter(id => id !== dish.id) : [...prev, dish.id];
    });
  };

  const rateDish = (dishId: string, rating: number) => {
    setDishRatings(prev => ({ ...prev, [dishId]: rating }));
  };

  const toggleFavorite = (dishId: string) => {
    setFavoriteDishIds(prev =>
      prev.includes(dishId) ? prev.filter(item => item !== dishId) : [...prev, dishId]
    );
  };

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => [trimmed, ...prev.filter(item => item !== trimmed)].slice(0, 6));
  };

  const clearFavorites = () => setFavoriteDishIds([]);
  const clearRecentSearches = () => setRecentSearches([]);
  const setTheme = (value: 'light' | 'dark') => setThemeState(value);
  const setDeliveryPreferences = (value: DeliveryPreferences) => setDeliveryPreferencesState(value);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantGroups,
        restaurantCount,
        subTotal,
        deliveryFee,
        grandTotal,
        bestCoupon,
        discountAmount,
        finalTotal,
        pastOrders,
        addPlacedOrder,
        cancelPlacedOrder,
        flaggedDeals,
        selectedCuisine,
        setSelectedCuisine,
         searchQuery,
         setSearchQuery: updateSearchQuery,
         dishRatings,
        rateDish,
        favoriteDishIds,
        toggleFavorite,
        clearFavorites,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        theme,
        setTheme,
        deliveryPreferences,
        setDeliveryPreferences,
        addToCart,
        updateQuantity,
        clearCart,
        resetSessionState,
        toggleFlashDealFlag,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
