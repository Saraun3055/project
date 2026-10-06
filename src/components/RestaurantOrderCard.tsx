import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RestaurantOrder, RestaurantOrderStatus, RESTAURANT_ORDER_STATUS } from '../api/restaurantApi';

export const formatCurrency = (value: number): string => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

const formatTimeAgo = (iso: string): string => {
  const parsed = new Date(iso).getTime();
  if (!Number.isFinite(parsed)) return '';

  const minutes = Math.max(0, Math.floor((Date.now() - parsed) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

const TONES: Partial<Record<RestaurantOrderStatus, { bg: string; text: string }>> = {
  [RESTAURANT_ORDER_STATUS.PLACED]: { bg: '#FFF3E0', text: '#EF6C00' },
  [RESTAURANT_ORDER_STATUS.AWAITING]: { bg: '#FFF3E0', text: '#EF6C00' },
  [RESTAURANT_ORDER_STATUS.ACCEPTED]: { bg: '#E3F2FD', text: '#1565C0' },
  [RESTAURANT_ORDER_STATUS.PREPARING]: { bg: '#E3F2FD', text: '#1565C0' },
  [RESTAURANT_ORDER_STATUS.READY]: { bg: '#E8F5E9', text: '#2E7D32' },
  [RESTAURANT_ORDER_STATUS.PICKED_UP]: { bg: '#F3E5F5', text: '#6A1B9A' },
  [RESTAURANT_ORDER_STATUS.DELIVERED]: { bg: '#E8F5E9', text: '#2E7D32' },
  [RESTAURANT_ORDER_STATUS.DECLINED]: { bg: '#FFEBEE', text: '#C62828' },
};

const FALLBACK_TONE = { bg: '#ECEFF1', text: '#455A64' };

interface Props {
  order: RestaurantOrder;
  actions?: React.ReactNode;
}

export const RestaurantOrderCard: React.FC<Props> = ({ order, actions }) => {
  const tone = TONES[order.status] ?? FALLBACK_TONE;
  const commissionPercent = Math.round((Number(order.commissionRate) || 0) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.customer}>{order.customerName || 'Guest'}</Text>
          <Text style={styles.meta}>
            #{order.orderId} · {formatTimeAgo(order.placedAt)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: tone.bg }]}>
          <Text style={[styles.badgeText, { color: tone.text }]}>{order.status}</Text>
        </View>
      </View>

      <View style={styles.items}>
        {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
          <View key={`${item.dishId}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemQty}>{item.quantity}×</Text>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemTotal}>{formatCurrency(item.lineTotal)}</Text>
          </View>
        ))}
      </View>

      {order.status === RESTAURANT_ORDER_STATUS.DECLINED && order.declineReason ? (
        <Text style={styles.declineReason}>{order.declineReason}</Text>
      ) : null}

      <View style={styles.moneyRow}>
        <View style={styles.moneyBlock}>
          <Text style={styles.moneyLabel}>Order value</Text>
          <Text style={styles.moneyValue}>{formatCurrency(order.subtotal)}</Text>
        </View>
        <View style={styles.moneyBlock}>
          <Text style={styles.moneyLabel}>Commission ({commissionPercent}%)</Text>
          <Text style={[styles.moneyValue, styles.moneyValueMuted]}>
            −{formatCurrency(order.commissionAmount)}
          </Text>
        </View>
        <View style={styles.moneyBlock}>
          <Text style={styles.moneyLabel}>Your payout</Text>
          <Text style={[styles.moneyValue, styles.moneyValueAccent]}>{formatCurrency(order.payoutAmount)}</Text>
        </View>
      </View>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerText: { flex: 1, marginRight: 8 },
  customer: { fontSize: 16, fontWeight: '800', color: '#111' },
  meta: { fontSize: 12, color: '#888', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  items: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemQty: { fontSize: 13, fontWeight: '700', color: '#FF5200', width: 28 },
  itemName: { flex: 1, fontSize: 14, color: '#333' },
  itemTotal: { fontSize: 13, color: '#666', marginLeft: 8 },
  declineReason: {
    marginTop: 8,
    fontSize: 12,
    color: '#C62828',
    fontStyle: 'italic',
  },
  moneyRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  moneyBlock: { flex: 1 },
  moneyLabel: { fontSize: 11, color: '#888' },
  moneyValue: { fontSize: 15, fontWeight: '800', color: '#111', marginTop: 2 },
  moneyValueMuted: { color: '#777' },
  moneyValueAccent: { color: '#2E7D32' },
  actions: { flexDirection: 'row', marginTop: 14 },
});
