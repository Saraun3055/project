import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { RestaurantNewOrdersTab } from '../components/RestaurantNewOrdersTab';
import { RestaurantOtherOrdersTab } from '../components/RestaurantOtherOrdersTab';
import { RestaurantStatsTab } from '../components/RestaurantStatsTab';

type DashboardTab = 'new_orders' | 'other_orders' | 'stats';

const TABS: { key: DashboardTab; label: string }[] = [
  { key: 'new_orders', label: 'New Orders' },
  { key: 'other_orders', label: 'Other Orders' },
  { key: 'stats', label: 'Stats' },
];

interface Props {
  restaurantId: string;
  onLogout: () => void;
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    style={styles.tab}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}>
    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    <View style={[styles.tabUnderline, isActive && styles.tabUnderlineActive]} />
  </TouchableOpacity>
);

export const RestaurantDashboardScreen: React.FC<Props> = ({ restaurantId, onLogout }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('new_orders');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Partner Dashboard</Text>
          <Text style={styles.subtitle}>Signed in as {restaurantId}</Text>
        </View>
        <TouchableOpacity onPress={onLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar} accessibilityRole="tablist">
        {TABS.map(tab => (
          <TabButton
            key={tab.key}
            label={tab.label}
            isActive={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'new_orders' ? <RestaurantNewOrdersTab /> : null}
        {activeTab === 'other_orders' ? <RestaurantOtherOrdersTab /> : null}
        {activeTab === 'stats' ? <RestaurantStatsTab /> : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerText: { flex: 1, marginRight: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 2 },
  logoutText: { color: '#D32F2F', fontWeight: 'bold' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: 12 },
  tabLabel: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabLabelActive: { color: '#FF5200', fontWeight: '800' },
  tabUnderline: { marginTop: 10, height: 3, width: 0 },
  tabUnderlineActive: { width: '100%', backgroundColor: '#FF5200' },
  content: { flex: 1 },
});
