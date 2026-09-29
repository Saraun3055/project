import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  restaurantId: string;
  onLogout: () => void;
}

export const RestaurantDashboardScreen: React.FC<Props> = ({ restaurantId, onLogout }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard ({restaurantId})</Text>
        <TouchableOpacity onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Active Orders</Text>
          <Text style={styles.statValue}>3</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Today's Earnings</Text>
          <Text style={styles.statValue}>₹4,500</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  logoutText: { color: '#D32F2F', fontWeight: 'bold' },
  content: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#FFF', padding: 16, borderRadius: 8, width: '48%', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  statTitle: { fontSize: 14, color: '#777', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#111' }
});
