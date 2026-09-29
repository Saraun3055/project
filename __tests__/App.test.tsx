/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { sanitizeCategoryList } from '../src/api/foodApi';
import { getStoredToken, simulateLogin, simulateLogout } from '../src/utils/authService';
import { clearSessionStorage, STORAGE_KEYS } from '../src/utils/storage';
import { matchesSearchQuery } from '../src/screens/HomeScreen';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

test('category values are normalized to stable strings for list keys', () => {
  const result = sanitizeCategoryList([
    'Indian',
    { name: 'Chinese' },
    'Fast Food',
    'Desserts',
    'Furniture',
  ]);

  expect(result).toEqual(['Indian', 'Chinese', 'Fast Food', 'Desserts']);
  expect(result.every((value) => typeof value === 'string')).toBe(true);
});
test('fallback categories are returned when the list is empty', () => {
  const result = sanitizeCategoryList([]);

  expect(result).toContain('Indian');
  expect(result.length).toBeGreaterThan(0);
});

test('home search matches dish and restaurant text across multiple words', () => {
  expect(matchesSearchQuery('butter chicken', ['Butter Chicken', 'Indian', 'Creamy curry', 'Mehfil Grand'])).toBe(true);
  expect(matchesSearchQuery('mehfil grand', ['Paneer Tikka', 'Indian', 'Tandoori dish', 'Mehfil Grand'])).toBe(true);
  expect(matchesSearchQuery('sushi', ['Paneer Tikka', 'Indian', 'Tandoori dish', 'Mehfil Grand'])).toBe(false);
  expect(matchesSearchQuery('  ', ['Paneer Tikka'])).toBe(true);
});

test('restores the email belonging to the last login', async () => {
  await AsyncStorage.clear();
  const result = await simulateLogin('last-account@example.com', 'Password123');

  expect(result.success).toBe(true);
  await expect(getStoredToken()).resolves.toEqual({ email: 'last-account@example.com' });
});

test('logout removes the persisted session', async () => {
  await AsyncStorage.clear();
  await simulateLogin('account-to-remove@example.com', 'Password123');
  await simulateLogout();

  await expect(getStoredToken()).resolves.toBeNull();
});

test('logout clears account-scoped storage but keeps device preferences', async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify({ email: 'old@example.com' }));
  await AsyncStorage.setItem(STORAGE_KEYS.userAddresses, JSON.stringify({ addresses: [] }));
  await AsyncStorage.setItem(STORAGE_KEYS.pastOrders, JSON.stringify([{ id: 'old-order' }]));
  await AsyncStorage.setItem(STORAGE_KEYS.appliedCoupon, JSON.stringify({ coupon: { code: 'OLD' }, discount: 10 }));
  await AsyncStorage.setItem(STORAGE_KEYS.theme, JSON.stringify('dark'));

  await clearSessionStorage();

  await expect(AsyncStorage.getItem(STORAGE_KEYS.userProfile)).resolves.toBeNull();
  await expect(AsyncStorage.getItem(STORAGE_KEYS.userAddresses)).resolves.toBeNull();
  await expect(AsyncStorage.getItem(STORAGE_KEYS.pastOrders)).resolves.toBeNull();
  await expect(AsyncStorage.getItem(STORAGE_KEYS.appliedCoupon)).resolves.toBeNull();
  await expect(AsyncStorage.getItem(STORAGE_KEYS.theme)).resolves.toBe('"dark"');
});
