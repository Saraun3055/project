import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { BackIcon } from '../components/Icons';

interface Props {
  onBack: () => void;
  onCheckout: () => void;
}

export const CartSummaryScreen: React.FC<Props> = ({ onBack, onCheckout }) => {
  const { cartItems, restaurantGroups, updateQuantity, clearCart, deliveryFee, finalTotal, bestCoupon, discountAmount } = useCart();

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackIcon size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Order from multiple restaurants and checkout together!
          </Text>
          <TouchableOpacity style={styles.shopBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.shopBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <BackIcon size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({totalItems})</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

{/* Multi-restaurant active order banner */}
      {restaurantGroups.length > 1 && (
        <View style={styles.multiBanner}>
          <Text style={styles.multiBannerEmoji}>🎉</Text>
          <Text style={styles.multiBannerTitle}>
            Ordering from {restaurantGroups.length} restaurants!
          </Text>
        </View>
      )}

      {/* Auto-applied coupon banner */}
      {bestCoupon && discountAmount > 0 && (
        <View style={styles.couponBanner}>
          <Text style={styles.couponBannerEmoji}>🏷️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.couponBannerTitle}>
              Coupon {bestCoupon.code} automatically applied!
            </Text>
            <Text style={styles.couponBannerSub}>
              You saved ₹{discountAmount} on this order.
            </Text>
          </View>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {restaurantGroups.map((group, idx) => (
          <View key={group.restaurantId} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupNum}>
                <Text style={styles.groupNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.groupName}>{group.restaurantName}</Text>
              <Text style={styles.groupSubtotal}>₹{group.subtotal}</Text>
            </View>

            {group.items.map(item => (
              <View key={item.dish.id} style={styles.itemRow}>
                <Image source={{ uri: item.dish.imageUrl }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.dish.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.dish.price}</Text>
                </View>
                <View style={styles.qtyContainer}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.dish.id, -1)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.dish.id, 1)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>
          {restaurantGroups.map(group => (
            <View key={group.restaurantId} style={styles.billRow}>
              <Text style={styles.billLabel}>{group.restaurantName}</Text>
              <Text style={styles.billValue}>₹{group.subtotal}</Text>
            </View>
          ))}
<View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee ({restaurantGroups.length}x)</Text>
            <Text style={styles.billValue}>₹{deliveryFee}</Text>
          </View>
          {bestCoupon && discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.couponLabel}>Coupon Applied ({bestCoupon.code})</Text>
              <Text style={styles.couponValue}>-₹{discountAmount}</Text>
            </View>
          )}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>₹{finalTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPrice}>₹{finalTotal}</Text>
          <Text style={styles.footerSubText}>incl. delivery & taxes</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout} activeOpacity={0.85}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </View>
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
  },
  clearText: {
    fontSize: 14,
    color: '#FF5200',
    fontWeight: '700',
  },
  placeholder: {
    width: 36,
  },
  multiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
multiBannerEmoji: { fontSize: 20 },
  multiBannerTitle: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  couponBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  couponBannerEmoji: { fontSize: 20 },
  couponBannerTitle: { fontSize: 13, fontWeight: '800', color: '#1B5E20' },
  couponBannerSub: { fontSize: 12, fontWeight: '600', color: '#2E7D32', marginTop: 2 },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
  },
  groupNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FF5200',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  groupNumText: { fontSize: 12, fontWeight: '900', color: '#FFF' },
  groupName: { flex: 1, fontSize: 15, fontWeight: '800', color: '#E65100' },
  groupSubtotal: { fontSize: 15, fontWeight: '800', color: '#FF5200' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  itemImage: {
    width: 50, height: 50, borderRadius: 10, marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginTop: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5200',
    borderRadius: 8,
    backgroundColor: '#FAF9F6',
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF5200',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF5200',
    paddingHorizontal: 4,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '700',
  },
billDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  couponLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '700',
  },
  couponValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '800',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF5200',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  footerPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF5200',
  },
  footerSubText: {
    fontSize: 11,
    color: '#777',
    fontWeight: '500',
  },
  checkoutBtn: {
    backgroundColor: '#FF5200',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#FF5200',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 70,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#222',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: '#FF5200',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

