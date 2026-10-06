import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  variant: 'loading' | 'error' | 'empty';
  message: string;
  onRetry?: () => void;
}

export const RestaurantTabState: React.FC<Props> = ({ variant, message, onRetry }) => {
  if (variant === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF5200" />
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{variant === 'error' ? '⚠️' : '🍽️'}</Text>
      <Text style={[styles.message, variant === 'error' && styles.errorMessage]}>{message}</Text>
      {variant === 'error' && onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  emoji: { fontSize: 32, marginBottom: 10 },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  errorMessage: { color: '#C62828' },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FF5200',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
