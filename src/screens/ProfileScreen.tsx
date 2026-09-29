import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { BackIcon } from '../components/Icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useCart } from '../context/CartContext';

interface PastOrder {
  id: string;
  date: string;
  items: string;
  total: number;
}

interface ProfileScreenProps {
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  pastOrders: PastOrder[];
  onBack: () => void;
  onLogout: () => void;
  onEditProfile?: () => void;
  onSavedAddresses?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userEmail,
  userName,
  userPhone,
  userAddress,
  pastOrders,
  onBack,
  onLogout,
  onEditProfile,
  onSavedAddresses
}) => {
  const { totalSpent, totalSavings, healthMeterInput, ordersPlacedCount } = useSelector((state: RootState) => state.progress);
  const { addresses, selectedAddressId } = useSelector((state: RootState) => state.user);
  const {
    theme,
    setTheme,
    recentSearches,
    clearRecentSearches,
    deliveryPreferences,
    setDeliveryPreferences,
    favoriteDishIds,
    clearFavorites,
  } = useCart();
  const displayEmail = userEmail || 'guest.explorer@foodexpress.com';
  const displayUsername = userName;
  const displayPhone = userPhone;
  const displayAddress = userAddress;

  // Use Redux props as the single source of truth for profile data
  const resolvedName = displayUsername || 'Gourmet Explorer';
  const resolvedEmail = displayEmail;
  const resolvedPhone = displayPhone;
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const resolvedAddress = selectedAddress?.fullAddress || displayAddress || 'No address saved';
  
  // Taste DNA computes automatically based on ordering behavior or static personalized tag
  const tasteDNA = 'Spicy Indian Lover • Sweet Tooth • Occasional Healthy Pasta Diner';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <BackIcon size={28} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.editBtn} onPress={onEditProfile} activeOpacity={0.7}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* User Card with stylized photo avatar */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {resolvedName.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{resolvedName}</Text>
            <Text style={styles.userSub}>{resolvedEmail}</Text>
            <Text style={styles.userPhone}>{resolvedPhone}</Text>
          </View>
        </View>

        {/* Purchase Progress Dashboard */}
        <Text style={styles.sectionTitle}>📊 App Spend & Savings Tracker</Text>
        <View style={styles.progressDashboard}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statVal}>₹{totalSpent}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Savings</Text>
            <Text style={[styles.statVal, { color: '#2E7D32' }]}>₹{totalSavings}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={[styles.statVal, { color: '#0288D1' }]}>{ordersPlacedCount}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Meal Value</Text>
            <Text style={[styles.statVal, { color: '#FF5200' }]}>{healthMeterInput}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>⚙️ Preferences</Text>
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>Theme</Text>
            <TouchableOpacity style={[styles.toggleChip, theme === 'dark' && styles.toggleChipActive]} onPress={() => {
              const nextTheme = theme === 'dark' ? 'light' : 'dark';
              setTheme(nextTheme);
              Alert.alert('Theme Updated', `Application theme switched to ${nextTheme}.`);
            }}>
              <Text style={[styles.toggleText, theme === 'dark' && styles.toggleTextActive]}>{theme === 'dark' ? 'Dark' : 'Light'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>Delivery mode</Text>
            <TouchableOpacity style={styles.toggleChip} onPress={() => {
              const nextMode = deliveryPreferences.deliveryMode === 'delivery' ? 'pickup' : 'delivery';
              setDeliveryPreferences({ ...deliveryPreferences, deliveryMode: nextMode });
              Alert.alert('Delivery preference saved', `Delivery mode set to ${nextMode}.`);
            }}>
              <Text style={styles.toggleText}>{deliveryPreferences.deliveryMode === 'delivery' ? 'Delivery' : 'Pickup'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.preferenceHint}>Saved note: {deliveryPreferences.notes}</Text>
        </View>

        <Text style={styles.sectionTitle}>🧬 My Taste DNA</Text>
        <View style={styles.dnaCard}>
          <View style={styles.dnaHeaderRow}>
            <Text style={styles.dnaTitle}>Your Flavor Profile</Text>
            <Text style={styles.dnaBadge}>Active</Text>
          </View>
          <Text style={styles.dnaText}>{tasteDNA}</Text>
          <Text style={styles.dnaSub}>Based on your recent cart selections & view preferences.</Text>
        </View>

        <Text style={styles.sectionTitle}>🕘 Recent Searches</Text>
        <View style={styles.recentCard}>
          {recentSearches.length === 0 ? (
            <Text style={styles.emptyPastText}>No recent searches yet.</Text>
          ) : (
            recentSearches.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.recentPill}><Text style={styles.recentPillText}>{item}</Text></View>
            ))
          )}
          {recentSearches.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => { clearRecentSearches(); Alert.alert('Recent searches cleared', 'Your search history was removed from storage.'); }}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>💙 Favorites</Text>
        <View style={styles.recentCard}>
          {favoriteDishIds.length === 0 ? (
            <Text style={styles.emptyPastText}>No favorite dishes saved yet.</Text>
          ) : (
            <Text style={styles.favoriteCount}>{favoriteDishIds.length} dishes saved</Text>
          )}
          {favoriteDishIds.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => { clearFavorites(); Alert.alert('Favorites cleared', 'Saved dishes were removed from storage.'); }}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Address Block */}
        <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
        <TouchableOpacity style={styles.addressCard} onPress={onSavedAddresses} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.addressTitle}>
              {selectedAddress ? `${selectedAddress.label} Address` : 'Home Address'}
            </Text>
            <Text style={{ color: '#FF5200', fontSize: 12, fontWeight: '700' }}>
              {addresses.length} address{addresses.length !== 1 ? 'es' : ''} → Manage
            </Text>
          </View>
          <Text style={styles.addressText}>{resolvedAddress}</Text>
        </TouchableOpacity>

        {/* past orders section */}
        <Text style={styles.sectionTitle}>Past Orders</Text>
        {pastOrders.length === 0 ? (
          <View style={styles.emptyPastOrders}>
            <Text style={styles.emptyPastText}>No orders placed yet. Hungry?</Text>
          </View>
        ) : (
          pastOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <Text style={styles.orderItems}>{order.items}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderPrice}>Total Paid: ₹{order.total}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Delivered</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Settings options list */}
        <Text style={styles.sectionTitle}>Account Options</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionRow} onPress={onSavedAddresses}>
            <Text style={styles.optionText}>Saved Addresses</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionRow}>
            <Text style={styles.optionText}>Help & Support</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionRow, { borderBottomWidth: 0 }]} onPress={onLogout}>
            <Text style={[styles.optionText, { color: '#C62828' }]}>Sign Out</Text>
            <Text style={[styles.arrow, { color: '#C62828' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    flex: 1,
    textAlign: 'center',
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFE6DB',
    borderRadius: 8,
  },
  editBtnText: {
    color: '#FF5200',
    fontWeight: '700',
    fontSize: 13,
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  syncText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '600',
  },
  syncErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F9D6CC',
  },
  syncErrorText: {
    flex: 1,
    fontSize: 12,
    color: '#B3261E',
    fontWeight: '600',
    marginRight: 12,
  },
  syncRetry: {
    backgroundColor: '#FF5200',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncRetryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF5200',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
  },
  userSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
  },
  userPhone: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#555',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dnaCard: {
    backgroundColor: '#FFF0E6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FFE0CC',
  },
  dnaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dnaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF5200',
  },
  dnaBadge: {
    backgroundColor: '#FF5200',
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dnaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    lineHeight: 18,
    marginBottom: 6,
  },
  dnaSub: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  preferenceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  toggleChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  toggleChipActive: {
    backgroundColor: '#FF5200',
  },
  toggleText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  preferenceHint: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentPill: {
    backgroundColor: '#FFF0E6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  recentPillText: {
    color: '#FF5200',
    fontSize: 12,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#FFF4F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  clearText: {
    color: '#C62828',
    fontSize: 11,
    fontWeight: '700',
  },
  favoriteCount: {
    color: '#333',
    fontSize: 13,
    fontWeight: '700',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    fontWeight: '500',
  },
  emptyPastOrders: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyPastText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    paddingBottom: 8,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF5200',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
  },
  orderItems: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  progressDashboard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#777',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EEEEEE',
  },
});
