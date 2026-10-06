import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useRestaurantOrders } from '../hooks/useRestaurantOrders';
import { RESTAURANT_ORDER_STATUS, RestaurantOrder } from '../api/restaurantApi';
import { RestaurantOrderCard } from './RestaurantOrderCard';
import { RestaurantTabState } from './RestaurantTabState';

const IN_FLIGHT_STATUSES: string[] = [
  RESTAURANT_ORDER_STATUS.ACCEPTED,
  RESTAURANT_ORDER_STATUS.PREPARING,
  RESTAURANT_ORDER_STATUS.READY,
  RESTAURANT_ORDER_STATUS.PICKED_UP,
];

export const RestaurantOtherOrdersTab: React.FC = () => {
  const { settled, isLoading, isRefreshing, errorMessage, refresh, retry } = useRestaurantOrders({ poll: true });

  const inFlightCount = settled.filter(order => IN_FLIGHT_STATUSES.includes(order.status)).length;

  const renderItem = ({ item }: { item: RestaurantOrder }) => {
    return <RestaurantOrderCard order={item} />;
  };

  if (isLoading) {
    return <RestaurantTabState variant="loading" message="Loading order history..." />;
  }

  if (errorMessage) {
    return <RestaurantTabState variant="error" message={errorMessage} onRetry={retry} />;
  }

  return (
    <FlatList
      data={settled}
      keyExtractor={item => item.orderId}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#FF5200" colors={['#FF5200']} />
      }
      ListHeaderComponent={
        settled.length > 0 ? (
          <Text style={styles.countText}>
            {inFlightCount} in progress · {settled.length - inFlightCount} finished
          </Text>
        ) : undefined
      }
      ListEmptyComponent={
        <RestaurantTabState variant="empty" message="No other orders yet. Accepted and delivered orders show up here." />
      }
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 16, flexGrow: 1 },
  countText: { fontSize: 13, color: '#777', marginBottom: 12 },
});
