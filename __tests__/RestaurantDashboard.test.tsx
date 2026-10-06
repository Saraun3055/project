/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RestaurantDashboardScreen } from '../src/screens/RestaurantDashboardScreen';
import {
  RestaurantApiError,
  RestaurantOrder,
  RestaurantStats,
  RESTAURANT_ORDER_STATUS,
} from '../src/api/restaurantApi';

const mockFetchRestaurantOrders = jest.fn<Promise<RestaurantOrder[]>, []>();
const mockUpdateRestaurantOrder = jest.fn();
const mockFetchRestaurantStats = jest.fn<Promise<RestaurantStats>, []>();

jest.mock('../src/api/restaurantApi', () => {
  const actual = jest.requireActual('../src/api/restaurantApi');
  return {
    ...actual,
    fetchRestaurantOrders: () => mockFetchRestaurantOrders(),
    updateRestaurantOrder: (...args: unknown[]) => mockUpdateRestaurantOrder(...args),
    fetchRestaurantStats: () => mockFetchRestaurantStats(),
  };
});

const buildOrder = (overrides: Partial<RestaurantOrder>): RestaurantOrder => ({
  orderId: 'ord-1',
  transactionId: 'txn-1',
  customerId: 'u1',
  customerName: 'Aarav Sharma',
  restaurantId: 'rest1',
  restaurantName: 'Mehfil Grand',
  items: [{ dishId: 'd1', name: 'Butter Chicken', quantity: 1, price: 349, lineTotal: 349 }],
  subtotal: 349,
  discountShare: 0,
  deliveryFeeShare: 0,
  commissionRate: 0.12,
  commissionAmount: 42,
  payoutAmount: 307,
  prepMinutes: 18,
  acceptedAt: null,
  declinedAt: null,
  placedAt: new Date().toISOString(),
  status: RESTAURANT_ORDER_STATUS.AWAITING,
  ...overrides,
});

const buildStats = (overrides: Partial<RestaurantStats> = {}): RestaurantStats => ({
  restaurantId: 'rest1',
  orderCount: 12,
  newOrderCount: 1,
  inProgressCount: 2,
  deliveredOrderCount: 9,
  declinedOrderCount: 1,
  grossRevenue: 4188,
  deliveredRevenue: 3146,
  netPayout: 3685,
  pendingPayout: 539,
  platformCommission: 503,
  deliveryFeeShare: 320,
  refundedAmount: 514,
  averageOrderValue: 381,
  ...overrides,
});

const collectText = (node: any): string => {
  if (node === null || node === undefined || node === false) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(collectText).join('');
  return collectText(node.children);
};

const findPressable = (node: any, label: string): any => {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findPressable(child, label);
      if (found) return found;
    }
    return null;
  }
  if (typeof node.props?.onPress === 'function' && collectText(node).trim() === label) return node;
  return findPressable(node.children, label);
};

const findText = (node: any, value: string): any => {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findText(child, value);
      if (found) return found;
    }
    return null;
  }
  if (node.props?.children === value) return node;
  return findText(node.children, value);
};

let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

const mount = async () => {
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <RestaurantDashboardScreen restaurantId="rest1" onLogout={jest.fn()} />,
    );
  });
};

const tap = async (label: string) => {
  const target = findPressable(renderer!.toJSON(), label);
  if (!target) throw new Error(`No pressable labelled "${label}" was rendered.`);
  await ReactTestRenderer.act(() => {
    target.props.onPress();
  });
};

afterEach(() => {
  if (renderer) {
    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
    renderer = null;
  }
  jest.clearAllMocks();
});

test('renders the header and all three tab labels', async () => {
  mockFetchRestaurantOrders.mockResolvedValue([]);
  await mount();

  const tree = renderer!.toJSON();
  expect(findText(tree, 'Partner Dashboard')).toBeTruthy();
  expect(findText(tree, 'Signed in as rest1')).toBeTruthy();
  expect(findText(tree, 'New Orders')).toBeTruthy();
  expect(findText(tree, 'Other Orders')).toBeTruthy();
  expect(findText(tree, 'Stats')).toBeTruthy();
});

test('new orders tab lists only orders still awaiting a decision', async () => {
  mockFetchRestaurantOrders.mockResolvedValue([
    buildOrder({ orderId: 'ord-awaiting' }),
    buildOrder({
      orderId: 'ord-preparing',
      status: RESTAURANT_ORDER_STATUS.PREPARING,
      acceptedAt: new Date().toISOString(),
    }),
  ]);
  await mount();

  const tree = renderer!.toJSON();
  expect(findText(tree, 'ord-awaiting')).toBeTruthy();
  expect(findText(tree, 'ord-preparing')).toBeNull();
  expect(findText(tree, 'Accept')).toBeTruthy();
  expect(findText(tree, 'Decline')).toBeTruthy();
});

test('accepting an order sends the accepted decision for that order id', async () => {
  mockFetchRestaurantOrders.mockResolvedValue([buildOrder({ orderId: 'ord-awaiting' })]);
  mockUpdateRestaurantOrder.mockResolvedValue(buildOrder({ orderId: 'ord-awaiting' }));
  await mount();

  await tap('Accept');

  expect(mockUpdateRestaurantOrder).toHaveBeenCalledWith('ord-awaiting', 'accept');
});

test('declining an order sends the declined decision for that order id', async () => {
  mockFetchRestaurantOrders.mockResolvedValue([buildOrder({ orderId: 'ord-awaiting' })]);
  mockUpdateRestaurantOrder.mockResolvedValue(buildOrder({ orderId: 'ord-awaiting' }));
  await mount();

  await tap('Decline');

  expect(mockUpdateRestaurantOrder).toHaveBeenCalledWith('ord-awaiting', 'decline');
});

test('other orders tab shows settled orders with a read-only live status', async () => {
  mockFetchRestaurantOrders.mockResolvedValue([
    buildOrder({ orderId: 'ord-awaiting' }),
    buildOrder({ orderId: 'ord-delivered', status: RESTAURANT_ORDER_STATUS.DELIVERED }),
  ]);
  await mount();

  await tap('Other Orders');

  const tree = renderer!.toJSON();
  expect(findText(tree, 'ord-delivered')).toBeTruthy();
  expect(findText(tree, 'ord-awaiting')).toBeNull();
  expect(findText(tree, RESTAURANT_ORDER_STATUS.DELIVERED)).toBeTruthy();
  expect(findText(tree, 'Accept')).toBeNull();
});

test('stats tab renders the revenue, commission and payout summary', async () => {
  mockFetchRestaurantOrders.mockResolvedValue([]);
  mockFetchRestaurantStats.mockResolvedValue(buildStats());
  await mount();

  await tap('Stats');

  const tree = renderer!.toJSON();
  expect(findText(tree, 'Total revenue')).toBeTruthy();
  expect(findText(tree, '₹4,188')).toBeTruthy();
  expect(findText(tree, '−₹503')).toBeTruthy();
  expect(findText(tree, '₹3,685')).toBeTruthy();
  expect(findText(tree, 'Total orders')).toBeTruthy();
  expect(findText(tree, '12')).toBeTruthy();
});

test('a load failure shows the error and a retry instead of an empty list', async () => {
  mockFetchRestaurantOrders.mockRejectedValue(
    new RestaurantApiError('Your restaurant session has expired. Please sign in again.', 401),
  );
  await mount();

  const tree = renderer!.toJSON();
  expect(findText(tree, 'Your restaurant session has expired. Please sign in again.')).toBeTruthy();
  expect(findPressable(tree, 'Retry')).toBeTruthy();
  expect(findText(tree, 'No new orders right now! Pull down to check again.')).toBeNull();
});

test('retrying after a failure refetches the orders', async () => {
  mockFetchRestaurantOrders.mockRejectedValueOnce(new RestaurantApiError('Kitchen service unavailable.'));
  await mount();

  mockFetchRestaurantOrders.mockResolvedValue([buildOrder({ orderId: 'ord-retry' })]);
  await tap('Retry');

  expect(mockFetchRestaurantOrders).toHaveBeenCalledTimes(2);
  expect(findText(renderer!.toJSON(), 'ord-retry')).toBeTruthy();
});
