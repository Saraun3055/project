import { apiClient } from './foodApi';
import { getStoredRestaurantSession } from '../utils/authService';

export const RESTAURANT_ORDER_STATUS = {
  PLACED: 'Placed',
  AWAITING: 'Awaiting restaurant confirmation',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready for pickup',
  PICKED_UP: 'Picked up',
  DELIVERED: 'Delivered',
  DECLINED: 'Declined',
} as const;

export type RestaurantOrderStatus = (typeof RESTAURANT_ORDER_STATUS)[keyof typeof RESTAURANT_ORDER_STATUS];

export type RestaurantOrderAction = 'accept' | 'decline';

export interface RestaurantOrderItem {
  dishId: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface RestaurantOrder {
  orderId: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  items: RestaurantOrderItem[];
  subtotal: number;
  discountShare: number;
  deliveryFeeShare: number;
  commissionRate: number;
  commissionAmount: number;
  payoutAmount: number;
  prepMinutes: number;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason?: string;
  placedAt: string;
  status: RestaurantOrderStatus;
  statusLabel?: string;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  prepProgress?: number;
  isActive?: boolean;
  completed?: boolean;
  progress?: number;
}

export interface RestaurantStats {
  restaurantId: string;
  orderCount: number;
  newOrderCount: number;
  inProgressCount: number;
  deliveredOrderCount: number;
  declinedOrderCount: number;
  grossRevenue: number;
  deliveredRevenue: number;
  netPayout: number;
  pendingPayout: number;
  platformCommission: number;
  deliveryFeeShare: number;
  refundedAmount: number;
  averageOrderValue: number;
}

export class RestaurantApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'RestaurantApiError';
    this.status = status;
  }
}

const OFFLINE_MESSAGE = 'Cannot reach the kitchen service. Check your connection and try again.';

const restaurantAuthHeader = async (): Promise<{ Authorization: string }> => {
  const session = await getStoredRestaurantSession();
  if (!session?.token) {
    throw new RestaurantApiError('Your restaurant session has expired. Please sign in again.', 401);
  }
  return { Authorization: `Bearer ${session.token}` };
};

const toApiError = (error: unknown, fallback: string): RestaurantApiError => {
  if (error instanceof RestaurantApiError) return error;
  const response = (error as { response?: { status?: number; data?: { error?: string } } })?.response;
  if (response?.data?.error) return new RestaurantApiError(response.data.error, response.status);
  return new RestaurantApiError(fallback);
};

export const fetchRestaurantOrders = async (): Promise<RestaurantOrder[]> => {
  const headers = await restaurantAuthHeader();
  try {
    const { data } = await apiClient.get<{ orders?: RestaurantOrder[] }>('/restaurant/orders', { headers });
    return Array.isArray(data?.orders) ? data.orders : [];
  } catch (error) {
    throw toApiError(error, OFFLINE_MESSAGE);
  }
};

export const updateRestaurantOrder = async (
  orderId: string,
  action: RestaurantOrderAction,
  options: { prepMinutes?: number; reason?: string } = {},
): Promise<RestaurantOrder> => {
  const headers = await restaurantAuthHeader();
  const status = action === 'decline' ? RESTAURANT_ORDER_STATUS.DECLINED : RESTAURANT_ORDER_STATUS.ACCEPTED;
  try {
    const { data } = await apiClient.patch<{ order?: RestaurantOrder }>(
      `/restaurant/orders/${encodeURIComponent(orderId)}`,
      { status, prepMinutes: options.prepMinutes, reason: options.reason },
      { headers },
    );
    if (!data?.order) {
      throw new RestaurantApiError('The kitchen service did not return the updated order.');
    }
    return data.order;
  } catch (error) {
    throw toApiError(error, 'Could not update this order. Please try again.');
  }
};

export const fetchRestaurantStats = async (): Promise<RestaurantStats> => {
  const headers = await restaurantAuthHeader();
  try {
    const { data } = await apiClient.get<{ stats?: RestaurantStats }>('/restaurant/stats', { headers });
    if (!data?.stats) {
      throw new RestaurantApiError('The kitchen service did not return any stats.');
    }
    return data.stats;
  } catch (error) {
    throw toApiError(error, OFFLINE_MESSAGE);
  }
};

export const isAwaitingRestaurantDecision = (order: RestaurantOrder): boolean =>
  order.status === RESTAURANT_ORDER_STATUS.PLACED || order.status === RESTAURANT_ORDER_STATUS.AWAITING;

const placedAtMs = (order: RestaurantOrder): number => {
  const parsed = new Date(order.placedAt).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

export const splitRestaurantOrders = (
  orders: RestaurantOrder[],
): { awaiting: RestaurantOrder[]; settled: RestaurantOrder[] } => {
  const awaiting: RestaurantOrder[] = [];
  const settled: RestaurantOrder[] = [];
  orders.forEach(order => (isAwaitingRestaurantDecision(order) ? awaiting : settled).push(order));

  return {
    awaiting: awaiting.sort((a, b) => placedAtMs(a) - placedAtMs(b)),
    settled: settled.sort((a, b) => placedAtMs(b) - placedAtMs(a)),
  };
};
