import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { RESTAURANTS, DISHES, Restaurant, Dish } from '../data/mockData';
import { getRestaurants, getDishes } from '../api/foodApi';
import { useCart } from '../context/CartContext';
import { SearchIcon } from '../components/Icons';

const CUISINE_FILTERS = ['All', 'Indian', 'Chinese', 'Italian', 'Fast Food', 'Desserts'];

const cuisinePalette: Record<string, { bg: string; text: string }> = {
  Indian:    { bg: '#FFF3E0', text: '#E65100' },
  Chinese:   { bg: '#FFEBEE', text: '#C62828' },
  Italian:   { bg: '#E8F5E9', text: '#2E7D32' },
  'Fast Food':{ bg: '#E3F2FD', text: '#1565C0' },
  Desserts:  { bg: '#FFF8E1', text: '#F57F17' },
};


interface Props {
  onAddToCart: (dish: Dish) => void;
  onNavigateToCart: () => void;
  initialSearchQuery?: string;
}

export const RestaurantsScreen: React.FC<Props> = ({ onAddToCart, onNavigateToCart, initialSearchQuery = '' }) => {
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [loadedRestaurants, setLoadedRestaurants] = useState<Restaurant[]>(RESTAURANTS);
  const [loadedDishes, setLoadedDishes] = useState<Dish[]>(DISHES);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const { cartItems, restaurantCount, finalTotal, restaurantGroups } = useCart();

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const totalCartItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  const loadRestaurants = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const [restaurants, dishes] = await Promise.all([getRestaurants(), getDishes()]);
      setLoadedRestaurants(restaurants);
      setLoadedDishes(dishes);
    } catch {
      setErrorMessage('Unable to load restaurants right now. Please retry.');
      setLoadedRestaurants(RESTAURANTS);
      setLoadedDishes(DISHES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    let list = loadedRestaurants;
    if (selectedCuisine !== 'All') {
      list = list.filter(r => r.cuisine === selectedCuisine);
    }
    const keyword = searchQuery.trim().toLowerCase();
    if (keyword) {
      list = list.filter(
        r =>
          r.name.toLowerCase().includes(keyword) ||
          r.description.toLowerCase().includes(keyword) ||
          r.cuisine.toLowerCase().includes(keyword)
      );
    }
    return list;
  }, [loadedRestaurants, selectedCuisine, searchQuery]);

  const dishesFor = (restaurantId: string) => {
    const all = loadedDishes.filter(d => d.restaurantId === restaurantId);
    return all.length ? all : DISHES.filter(d => d.restaurantId === restaurantId);
  };

  const getCartCountForRestaurant = (restaurantId: string) => {
    return cartItems
      .filter(i => i.dish.restaurantId === restaurantId)
      .reduce((s, i) => s + i.quantity, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>🍽️ Food Express</Text>
          <Text style={styles.tagline}>Order from multiple restaurants at once</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={onNavigateToCart} activeOpacity={0.85}>
          <Text style={styles.cartBtnIcon}>🛒</Text>
          {totalCartItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Multi-restaurant active order banner */}
      {restaurantCount > 1 && (
        <TouchableOpacity style={styles.multiBanner} onPress={onNavigateToCart} activeOpacity={0.85}>
          <Text style={styles.multiBannerEmoji}>🎉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.multiBannerTitle}>
              Ordering from {restaurantCount} restaurants!
            </Text>
            <Text style={styles.multiBannerSub}>
              {restaurantGroups.map(g => g.restaurantName).join(' + ')} · ₹{finalTotal}
            </Text>
          </View>
          <Text style={styles.multiBannerArrow}>→</Text>
        </TouchableOpacity>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Mix & Match</Text>
            <Text style={styles.heroSub}>Order from different restaurants{'\n'}in a single checkout 🛒</Text>
          </View>
        </View>

{/* Live Search */}
        <View style={styles.searchContainer}>
          <SearchIcon size={18} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines or dishes..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Cuisine Filter */}
        <FlatList
          horizontal
          data={CUISINE_FILTERS}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          style={styles.filterRow}
          renderItem={({ item }) => {
            const isActive = selectedCuisine === item;
            const pal = item !== 'All' ? cuisinePalette[item] : null;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isActive && { backgroundColor: pal?.bg ?? '#FF5200', borderColor: pal?.text ?? '#FF5200' },
                ]}
                onPress={() => setSelectedCuisine(item)}
                activeOpacity={0.8}>
                <Text style={[styles.filterText, isActive && { color: pal?.text ?? '#FF5200', fontWeight: '800' }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Restaurant count */}
        <Text style={styles.countText}>
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} available
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF5200" />
            <Text style={styles.loadingText}>Loading restaurants from the FoodExpress kitchen...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadRestaurants} activeOpacity={0.8}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
) : filteredRestaurants.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>🍽️ No restaurants match "{searchQuery}".</Text>
          </View>
        ) : (
          <>
        {filteredRestaurants.map(restaurant => {
          const cartCount = getCartCountForRestaurant(restaurant.id);
          const pal = cuisinePalette[restaurant.cuisine] ?? { bg: '#F5F5F5', text: '#333' };
          return (
            <View key={restaurant.id} style={styles.restaurantCard}>
              {/* Cover */}
              <View style={styles.coverContainer}>
                <Image source={{ uri: restaurant.coverImage }} style={styles.coverImage} />
                <View style={styles.coverOverlay} />
                {/* Cuisine badge */}
                <View style={[styles.cuisineBadge, { backgroundColor: pal.text }]}>
                  <Text style={styles.cuisineBadgeText}>{restaurant.cuisine}</Text>
                </View>
                {/* Cart indicator */}
                {cartCount > 0 && (
                  <TouchableOpacity style={styles.cartIndicator} onPress={onNavigateToCart}>
                    <Text style={styles.cartIndicatorText}>🛒 {cartCount} in cart</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Info */}
              <View style={styles.cardInfo}>
                <View style={styles.cardNameRow}>
                  <Text style={styles.cardName}>{restaurant.name}</Text>
                  <View style={styles.ratingPill}>
                    <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cardDescription} numberOfLines={1}>{restaurant.description}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>⏱ {restaurant.deliveryTime}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>💳 Min ₹{restaurant.minimumOrder}</Text>
                </View>
                <View style={styles.tagRow}>
                  {restaurant.tags.map((tag, i) => (
                    <View key={i} style={[styles.tag, { backgroundColor: pal.bg }]}>
                      <Text style={[styles.tagText, { color: pal.text }]}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* Dishes from this restaurant */}
                <Text style={styles.dishesLabel}>Popular dishes</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dishScroll}>
                  {dishesFor(restaurant.id).map(dish => (
                    <TouchableOpacity
                      key={dish.id}
                      style={[styles.dishChip, { backgroundColor: dish.color }]}
                      onPress={() => onAddToCart(dish)}
                      activeOpacity={0.8}>
                      <Text style={styles.dishChipEmoji}>{dish.emoji}</Text>
                      <View>
                        <Text style={styles.dishChipName} numberOfLines={1}>{dish.name}</Text>
                        <Text style={styles.dishChipPrice}>₹{dish.price}</Text>
                      </View>
                      <View style={styles.dishAddBtn}>
                        <Text style={styles.dishAddText}>+</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
</View>
          );
        })}

        <View style={{ height: totalCartItems > 0 ? 100 : 20 }} />
          </>
        )}
      </ScrollView>

      {/* Floating Cart CTA */}
      {totalCartItems > 0 && (
        <TouchableOpacity style={styles.floatingCart} onPress={onNavigateToCart} activeOpacity={0.9}>
          <View style={styles.floatingLeft}>
            <Text style={styles.floatingCount}>{totalCartItems} item{totalCartItems !== 1 ? 's' : ''}</Text>
            {restaurantCount > 1 && (
              <Text style={styles.floatingRestaurants}>{restaurantCount} restaurants</Text>
            )}
          </View>
          <Text style={styles.floatingTotal}>₹{finalTotal}</Text>
          <Text style={styles.floatingAction}>View Cart →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appName: { fontSize: 20, fontWeight: '900', color: '#FF5200' },
  tagline: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
  cartBtn: { position: 'relative', padding: 8 },
  cartBtnIcon: { fontSize: 24 },
  cartBadge: {
    position: 'absolute',
    top: 2, right: 2,
    backgroundColor: '#FF5200',
    borderRadius: 9, width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  multiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5200',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  multiBannerEmoji: { fontSize: 24 },
  multiBannerTitle: { fontSize: 13, fontWeight: '800', color: '#BF360C' },
  multiBannerSub: { fontSize: 11, color: '#E64A19', fontWeight: '600', marginTop: 2 },
  multiBannerArrow: { fontSize: 18, color: '#FF5200', fontWeight: '900' },
  scrollContent: { paddingBottom: 20 },
  heroBanner: {
    margin: 16,
    borderRadius: 18,
    overflow: 'hidden',
    height: 150,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4, lineHeight: 18 },
filterRow: { marginBottom: 4 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    color: '#B3261E',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#FF5200',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  filterText: { fontSize: 13, color: '#666', fontWeight: '600' },
  countText: { fontSize: 12, color: '#999', fontWeight: '600', paddingHorizontal: 18, marginTop: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  coverContainer: { height: 160, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.2)' },
  cuisineBadge: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4,
  },
  cuisineBadgeText: { fontSize: 11, color: '#FFF', fontWeight: '800' },
  cartIndicator: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: '#FF5200',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  cartIndicatorText: { fontSize: 11, color: '#FFF', fontWeight: '800' },
  cardInfo: { padding: 16 },
  cardNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 18, fontWeight: '900', color: '#111', flex: 1 },
  ratingPill: { backgroundColor: '#FFF8E1', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  ratingText: { fontSize: 12, fontWeight: '800', color: '#F57F17' },
  cardDescription: { fontSize: 12, color: '#888', fontWeight: '500', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  metaText: { fontSize: 12, color: '#666', fontWeight: '600' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CCC' },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: '700' },
  dishesLabel: { fontSize: 12, fontWeight: '800', color: '#444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  dishScroll: { marginHorizontal: -4 },
  dishChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    width: 200,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dishChipEmoji: { fontSize: 26 },
  dishChipName: { fontSize: 12, fontWeight: '700', color: '#222', width: 110 },
  dishChipPrice: { fontSize: 12, color: '#FF5200', fontWeight: '800', marginTop: 2 },
  dishAddBtn: {
    backgroundColor: '#FF5200',
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  dishAddText: { color: '#FFF', fontSize: 20, fontWeight: '900', lineHeight: 24 },
  floatingCart: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 20, right: 20,
    backgroundColor: '#FF5200',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    elevation: 8,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  floatingLeft: {},
  floatingCount: { fontSize: 14, color: '#FFF', fontWeight: '800' },
  floatingRestaurants: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  floatingTotal: { fontSize: 18, fontWeight: '900', color: '#FFF' },
  floatingAction: { fontSize: 14, color: '#FFF', fontWeight: '800' },
});

export default RestaurantsScreen;

