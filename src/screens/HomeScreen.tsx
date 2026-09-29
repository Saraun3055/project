import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useCart } from '../context/CartContext';
import { DISHES, CUISINES, COMBO_MEALS, RESTAURANTS, Dish, ComboMeal, Restaurant } from '../data/mockData';
import { fetchDishAndCategoryData, fetchPromoBanner, PromoBanner } from '../api/foodApi';
import { CuisineChip } from '../components/CuisineChip';
import { DishCard } from '../components/DishCard';
import { ComboCard } from '../components/ComboCard';
import { SearchIcon, ProfileIcon, CartIcon } from '../components/Icons';

interface HomeScreenProps {
  onSelectDish: (dish: Dish) => void;
  onAddToCart: (dish: Dish) => void;
  onAddComboToCart: (combo: ComboMeal) => void;
  cartCount: number;
  dietScore: number;
  onNavigateToCart: () => void;
  onNavigateToProfile: () => void;
  onNavigateToRestaurants: (query?: string) => void;
  onOpenDrawer: () => void;
}

export const matchesSearchQuery = (query: string, values: Array<string | undefined>) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const searchableText = values.filter(Boolean).join(' ').toLowerCase();
  return terms.every(term => searchableText.includes(term));
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectDish,
  onAddToCart,
  onAddComboToCart,
  cartCount,
  dietScore,
  onNavigateToCart,
  onNavigateToProfile,
  onNavigateToRestaurants,
  onOpenDrawer
}) => {
  const {
    flaggedDeals,
    toggleFlashDealFlag,
    selectedCuisine,
    setSelectedCuisine,
    searchQuery,
    setSearchQuery,
    addRecentSearch,
    theme,
  } = useCart();

  const [loadedDishes, setLoadedDishes] = useState<Dish[]>(DISHES);
  const [availableCategories, setAvailableCategories] = useState<string[]>([...CUISINES]);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHomeData = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { dishes, categories, promoBanner: banner } = await fetchDishAndCategoryData();
      setLoadedDishes(dishes);
      setAvailableCategories(categories);
      setPromoBanner(banner);
    } catch {
      setErrorMessage('Unable to load live dishes right now. Please retry.');
      setLoadedDishes(DISHES);
      setAvailableCategories([...CUISINES]);
      setPromoBanner({
        id: 'fallback-banner',
        title: 'Fresh Picks Today',
        message: 'Enjoy chef-curated meals and free delivery on your first order.',
        cta: 'Retry now',
        accentColor: '#FF5200',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const banner = await fetchPromoBanner();
      setPromoBanner(banner);
      await loadHomeData();
    };

    init();
  }, []);

  // Emojis for cuisines
  const cuisineEmojis: Record<string, string> = {
    Indian: '🍛',
    Chinese: '🥢',
    Italian: '🍕',
    'Fast Food': '🍔',
    Desserts: '🍰'
  };

  const filteredDishes = useMemo(() => {
    return loadedDishes.filter((dish) => {
      const matchesSearch = matchesSearchQuery(searchQuery, [
        dish.name,
        dish.cuisine,
        dish.description,
        dish.restaurantName,
      ]);
      const matchesCuisine = selectedCuisine ? dish.cuisine === selectedCuisine : true;

      return matchesSearch && matchesCuisine;
    });
  }, [loadedDishes, searchQuery, selectedCuisine]);

  const matchingRestaurants = useMemo(() => {
    const restaurants = new Map<string, Pick<Restaurant, 'id' | 'name' | 'cuisine' | 'rating' | 'deliveryTime' | 'description' | 'tags'>>();

    RESTAURANTS.forEach(restaurant => {
      restaurants.set(restaurant.id, restaurant);
    });

    loadedDishes.forEach(dish => {
      if (!restaurants.has(dish.restaurantId)) {
        restaurants.set(dish.restaurantId, {
          id: dish.restaurantId,
          name: dish.restaurantName,
          cuisine: dish.cuisine,
          rating: 0,
          deliveryTime: dish.deliveryTime,
          description: '',
          tags: [],
        });
      }
    });

    return Array.from(restaurants.values()).filter(restaurant =>
      matchesSearchQuery(searchQuery, [
        restaurant.name,
        restaurant.cuisine,
        restaurant.description,
        ...restaurant.tags,
      ])
    );
  }, [loadedDishes, searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  // Flash deals filtering
  const flashDeals = useMemo(() => {
    return loadedDishes.filter((d) => d.isFlashDeal);
  }, [loadedDishes]);

  // Determine health color & advice based on value score
  const getHealthAdvice = (score: number) => {
    if (score >= 75) return { color: '#2E7D32', text: 'Amazing Deal! You are getting maximum food value for money.', label: 'Best Value', comboId: 'c3' };
    if (score >= 50) return { color: '#EF6C00', text: 'Good value. Add a combo to increase savings.', label: 'Moderate Value', comboId: 'c1' };
    return { color: '#C62828', text: 'Basic value items. Select our Mega Tub to save more.', label: 'Basic Value', comboId: 'c4' };
  };

  const advice = getHealthAdvice(dietScore);
  const recommendedCombo = useMemo(() => COMBO_MEALS.find(c => c.id === advice.comboId), [advice.comboId]);

  return (
    <SafeAreaView style={[styles.container, theme === 'dark' && styles.containerDark]}>
      <StatusBar barStyle="dark-content" {...({ backgroundColor: '#FFFFFF' } as any)} />

      {/* Elegant Swiggy-like Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginRight: 12, padding: 4 }} onPress={onOpenDrawer} activeOpacity={0.8}>
            <Text style={{ fontSize: 24, color: '#FF5200', fontWeight: 'bold' }}>☰</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.appName}>FOOD EXPRESS</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              📍 Delivery to Home • Indiranagar, Bengaluru
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.cartIconWrapper} onPress={onNavigateToCart} activeOpacity={0.85}>
            <CartIcon size={24} color="#111" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileIconWrapper} onPress={onNavigateToProfile} activeOpacity={0.85}>
            <ProfileIcon size={34} color="#FF5200" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F6' }}>
          <ActivityIndicator size="large" color="#FF5200" />
          <Text style={{ marginTop: 12, color: '#666', fontWeight: '600' }}>Loading fresh dishes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDishes}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          removeClippedSubviews={true}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <SearchIcon size={20} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search restaurants, cuisines or dishes..."
                  placeholderTextColor="#888"
                  value={searchQuery}
                  onChangeText={(value) => {
                    setSearchQuery(value);
                    addRecentSearch(value);
                  }}
                />
              </View>

              {hasSearchQuery && (
                <View style={styles.searchResultsCard}>
                  <Text style={styles.searchResultsTitle}>Search results</Text>
                  <Text style={styles.searchResultsSummary}>
                    {matchingRestaurants.length} restaurant{matchingRestaurants.length !== 1 ? 's' : ''} · {filteredDishes.length} dish{filteredDishes.length !== 1 ? 'es' : ''}
                  </Text>
                  {matchingRestaurants.slice(0, 3).map(restaurant => (
                    <TouchableOpacity
                      key={restaurant.id}
                      style={styles.restaurantResult}
                      onPress={() => onNavigateToRestaurants(searchQuery)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.restaurantResultInfo}>
                        <Text style={styles.restaurantResultName}>{restaurant.name}</Text>
                        <Text style={styles.restaurantResultMeta}>
                          {restaurant.cuisine} · {restaurant.rating > 0 ? `★ ${restaurant.rating}` : restaurant.deliveryTime}
                        </Text>
                      </View>
                      <Text style={styles.restaurantResultArrow}>→</Text>
                    </TouchableOpacity>
                  ))}
                  {matchingRestaurants.length > 0 && (
                    <TouchableOpacity style={styles.viewRestaurantsButton} onPress={() => onNavigateToRestaurants(searchQuery)} activeOpacity={0.8}>
                      <Text style={styles.viewRestaurantsText}>View all restaurants</Text>
                    </TouchableOpacity>
                  )}
                  {matchingRestaurants.length === 0 && filteredDishes.length === 0 && (
                    <Text style={styles.noSearchResultsText}>No restaurants or dishes match "{searchQuery}".</Text>
                  )}
                </View>
              )}

              {!hasSearchQuery && (
                <>
              {promoBanner && (
                <View style={[styles.promoBanner, { borderLeftColor: promoBanner.accentColor }]}>
                  <Text style={styles.promoKicker}>Special Offer</Text>
                  <Text style={styles.promoTitle}>{promoBanner.title}</Text>
                  <Text style={styles.promoText}>{promoBanner.message}</Text>
                  <TouchableOpacity style={[styles.promoAction, { backgroundColor: promoBanner.accentColor }]}>
                    <Text style={styles.promoActionText}>{promoBanner.cta}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {errorMessage ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={loadHomeData}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Flash Deals quick-access strip */}
              <Text style={styles.sectionTitle}>⚡ Flash Deals (Limited Time)</Text>
              <View style={styles.flashDealsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashScroll}>
                  {flashDeals.map((deal) => (
                    <TouchableOpacity
                      key={deal.id}
                      style={[styles.flashChip, { backgroundColor: deal.color }]}
                      onPress={() => onSelectDish(deal)}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.flashEmoji}>{deal.emoji}</Text>
                      <View>
                        <Text style={styles.flashName} numberOfLines={1}>{deal.name}</Text>
                        <Text style={styles.flashDiscount}>{deal.discountPercent}% OFF</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Best Value Meal Calculator Banner */}
              <View style={styles.healthBanner}>
                <View style={styles.healthHeader}>
                  <Text style={styles.healthTitle}>Best Value Meal Calculator</Text>
                  <View style={[styles.healthLevelBadge, { backgroundColor: advice.color + '20' }]}>
                    <Text style={[styles.healthLevelText, { color: advice.color }]}>{advice.label}</Text>
                  </View>
                </View>
                <View style={styles.meterRow}>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${dietScore}%`, backgroundColor: advice.color }]} />
                    </View>
                  </View>
                  <Text style={[styles.scorePercent, { color: advice.color }]}>{dietScore}%</Text>
                </View>
                <Text style={styles.healthAdvice}>{advice.text}</Text>
                
                {/* Dynamic Combo Recommendation */}
                {recommendedCombo && (
                  <View style={styles.dynamicComboContainer}>
                    <Text style={styles.dynamicComboLabel}>Suggested for your cart:</Text>
                    <TouchableOpacity 
                      style={styles.dynamicComboCard}
                      onPress={() => onAddComboToCart(recommendedCombo)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dynamicComboEmoji}>{recommendedCombo.emoji}</Text>
                      <View style={styles.dynamicComboInfo}>
                        <Text style={styles.dynamicComboName}>{recommendedCombo.name}</Text>
                        <Text style={styles.dynamicComboPrice}>+ ₹{recommendedCombo.price}</Text>
                      </View>
                      <View style={styles.dynamicComboAddBtn}>
                        <Text style={styles.dynamicComboAddText}>ADD</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Categories (Horizontal Slider) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Cuisines</Text>
                {selectedCuisine && (
                  <TouchableOpacity onPress={() => setSelectedCuisine(null)}>
                    <Text style={styles.clearFilterText}>Clear Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryContent}
              >
                {availableCategories.map((cuisine) => (
                  <CuisineChip
                    key={cuisine}
                    name={cuisine}
                    emoji={cuisineEmojis[cuisine] || '🍽️'}
                    selected={selectedCuisine === cuisine}
                    onPress={() => setSelectedCuisine(selectedCuisine === cuisine ? null : cuisine)}
                  />
                ))}
              </ScrollView>

              {/* Combo Meals list */}
              <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Popular Combo Meals</Text>
              <FlatList
                data={COMBO_MEALS}
                renderItem={({ item }) => (
                  <ComboCard combo={item} onAddToCart={() => onAddComboToCart(item)} />
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.comboList}
              />

              {/* Dishes Grid Header */}
              <Text style={[styles.sectionTitle, { marginTop: 4 }]}>
                All Dishes Near You ({filteredDishes.length})
              </Text>
              {filteredDishes.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>🍳 No dishes found matching "{searchQuery}"</Text>
                </View>
              )}
                </>
              )}
            </>
          }
          renderItem={({ item }) => (
            <DishCard
              dish={item}
              onPress={() => onSelectDish(item)}
              onAddToCart={() => onAddToCart(item)}
              isFlagged={flaggedDeals.includes(item.id)}
              onToggleFlag={() => toggleFlashDealFlag(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF5200',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 240,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconWrapper: {
    position: 'relative',
    marginRight: 16,
    padding: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5200',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  profileIconWrapper: {
    padding: 2,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    marginTop: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
    marginLeft: 8,
  },
  searchResultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchResultsTitle: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
  },
  searchResultsSummary: {
    color: '#777',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 12,
  },
  restaurantResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  restaurantResultInfo: {
    flex: 1,
  },
  restaurantResultName: {
    color: '#111',
    fontSize: 14,
    fontWeight: '800',
  },
  restaurantResultMeta: {
    color: '#777',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  restaurantResultArrow: {
    color: '#FF5200',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 12,
  },
  viewRestaurantsButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  viewRestaurantsText: {
    color: '#FF5200',
    fontSize: 13,
    fontWeight: '800',
  },
  noSearchResultsText: {
    color: '#777',
    fontSize: 13,
    fontWeight: '600',
    paddingTop: 10,
  },
  promoBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  promoKicker: {
    color: '#FF5200',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  promoTitle: {
    color: '#111',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoText: {
    color: '#555',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  promoAction: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promoActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F9D6CC',
  },
  errorText: {
    flex: 1,
    color: '#B3261E',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  retryButton: {
    backgroundColor: '#FF5200',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  flashDealsContainer: {
    marginBottom: 24,
    marginHorizontal: -16,
  },
  flashScroll: {
    paddingHorizontal: 16,
  },
  flashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    width: 160,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  flashEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  flashName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111',
    width: 90,
  },
  flashDiscount: {
    fontSize: 10,
    fontWeight: '900',
    color: '#C62828',
    marginTop: 2,
  },
  healthBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#FF5200',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  healthTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#222',
  },
  healthLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  healthLevelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    flex: 1,
    marginRight: 12,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  scorePercent: {
    fontSize: 18,
    fontWeight: '900',
  },
  healthAdvice: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 12,
  },
  dynamicComboContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  dynamicComboLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  dynamicComboCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dynamicComboEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  dynamicComboInfo: {
    flex: 1,
  },
  dynamicComboName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  dynamicComboPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5200',
    marginTop: 2,
  },
  dynamicComboAddBtn: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dynamicComboAddText: {
    color: '#C62828',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  clearFilterText: {
    fontSize: 13,
    color: '#FF5200',
    fontWeight: '700',
  },
  categoryScroll: {
    marginBottom: 24,
    marginHorizontal: -16,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  comboList: {
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 30,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#777',
    fontWeight: '500',
  },
});
