import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchRestaurantStats, RestaurantApiError, RestaurantStats } from '../api/restaurantApi';
import { formatCurrency } from './RestaurantOrderCard';
import { RestaurantTabState } from './RestaurantTabState';

interface MetricProps {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'muted';
}

const Metric: React.FC<MetricProps> = ({ label, value, tone = 'default' }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, tone === 'accent' && styles.metricAccent, tone === 'muted' && styles.metricMuted]}>
      {value}
    </Text>
  </View>
);

export const RestaurantStatsTab: React.FC = () => {
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async (isRefresh: boolean) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setStats(await fetchRestaurantStats());
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(
        error instanceof RestaurantApiError
          ? error.message
          : 'Cannot reach the kitchen service. Check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  if (isLoading) {
    return <RestaurantTabState variant="loading" message="Loading your earnings..." />;
  }

  if (errorMessage || !stats) {
    return <RestaurantTabState variant="error" message={errorMessage || 'No stats available.'} onRetry={() => load(false)} />;
  }

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor="#FF5200" colors={['#FF5200']} />
      }>
      <Text style={styles.sectionTitle}>Earnings</Text>
      <View style={styles.grid}>
        <Metric label="Total revenue" value={formatCurrency(stats.grossRevenue)} />
        <Metric label="Commission paid" value={`−${formatCurrency(stats.platformCommission)}`} tone="muted" />
        <Metric label="Net payout" value={formatCurrency(stats.netPayout)} tone="accent" />
        <Metric label="Total orders" value={String(stats.orderCount)} />
      </View>

      <Text style={styles.sectionTitle}>Order breakdown</Text>
      <View style={styles.grid}>
        <Metric label="New" value={String(stats.newOrderCount)} />
        <Metric label="In progress" value={String(stats.inProgressCount)} />
        <Metric label="Delivered" value={String(stats.deliveredOrderCount)} />
        <Metric label="Declined" value={String(stats.declinedOrderCount)} />
      </View>

      <Text style={styles.sectionTitle}>Payout detail</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Average order value</Text>
          <Text style={styles.rowValue}>{formatCurrency(stats.averageOrderValue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Delivered revenue</Text>
          <Text style={styles.rowValue}>{formatCurrency(stats.deliveredRevenue)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Pending payout</Text>
          <Text style={styles.rowValue}>{formatCurrency(stats.pendingPayout)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Delivery fee share</Text>
          <Text style={styles.rowValue}>{formatCurrency(stats.deliveryFeeShare)}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Refunded</Text>
          <Text style={[styles.rowValue, stats.refundedAmount > 0 && styles.rowRefunded]}>
            {formatCurrency(stats.refundedAmount)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#777', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  metric: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  metricLabel: { fontSize: 12, color: '#777' },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginTop: 4,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    padding: 12,
  },
  metricAccent: { color: '#2E7D32' },
  metricMuted: { color: '#777' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEE',
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, color: '#666' },
  rowValue: { fontSize: 14, fontWeight: '700', color: '#111' },
  rowRefunded: { color: '#C62828' },
});
