import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { RestaurantOrder, updateRestaurantOrder } from '../api/restaurantApi';
import { RestaurantOrderCard } from './RestaurantOrderCard';
import { RestaurantTabState } from './RestaurantTabState';

export const RestaurantNewOrdersTab: React.FC = () => {
  const { awaiting, isLoading, isRefreshing, errorMessage, refresh, retry } = useRestaurantOrders({ poll: true });
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const handleDecision = useCallback(
    async (order: RestaurantOrder, action: 'accept' | 'decline') => {
      if (pendingOrderId) return;
      setPendingOrderId(order.orderId);
      setActionError('');
      try {
        await updateRestaurantOrder(order.orderId, action);
        await refresh();
      } catch (error) {
        setActionError(error instanceof Error ? error.message : 'Could not update this order.');
      } finally {
        setPendingOrderId(null);
      }
    },
    [pendingOrderId, refresh],
  );

  const renderItem = useCallback(
    ({ item }: { item: RestaurantOrder }) => {
      const isPending = pendingOrderId === item.orderId;
      return (
        <RestaurantOrderCard
          order={item}
          actions={
            <>
              <TouchableOpacity
                style={[styles.action, styles.declineAction, isPending && styles.actionDisabled]}
                onPress={() => handleDecision(item, 'decline')}
                disabled={isPending}
                activeOpacity={0.8}>
                <Text style={[styles.actionText, styles.declineText]}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.action, styles.acceptAction, isPending && styles.actionDisabled]}
                onPress={() => handleDecision(item, 'accept')}
                disabled={isPending}
                activeOpacity={0.8}>
                <Text style={[styles.actionText, styles.acceptText]}>{isPending ? 'Working...' : 'Accept'}</Text>
              </TouchableOpacity>
            </>
          }
        />
      );
    },
    [pendingOrderId, handleDecision],
  );

  if (isLoading) {
    return <RestaurantTabState variant="loading" message="Loading incoming orders..." />;
  }

  if (errorMessage) {
    return <RestaurantTabState variant="error" message={errorMessage} onRetry={retry} />;
  }

  return (
    <FlatList
      data={awaiting}
      keyExtractor={item => item.orderId}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#FF5200" colors={['#FF5200']} />
      }
      ListHeaderComponent={
        <View>
          {awaiting.length > 0 ? (
            <Text style={styles.countText}>
              {awaiting.length} order{awaiting.length === 1 ? '' : 's'} waiting for your response
            </Text>
          ) : null}
          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        <RestaurantTabState variant="empty" message="No new orders right now! Pull down to check again." />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, flexGrow: 1 },
  countText: { fontSize: 13, color: '#777', marginBottom: 12 },
  actionError: {
    fontSize: 13,
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  action: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionDisabled: { opacity: 0.5 },
  declineAction: { marginRight: 8, borderColor: '#FFCDD2', backgroundColor: '#FFF' },
  acceptAction: { backgroundColor: '#FF5200', borderColor: '#FF5200' },
  actionText: { fontSize: 15, fontWeight: '800' },
  declineText: { color: '#D32F2F' },
  acceptText: { color: '#FFF' },
});
