import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchRestaurantOrders,
  RestaurantApiError,
  RestaurantOrder,
  splitRestaurantOrders,
} from '../api/restaurantApi';

const POLL_INTERVAL_MS = 5000;

type LoadMode = 'initial' | 'refresh' | 'silent';

export const useRestaurantOrders = ({ poll = false }: { poll?: boolean } = {}) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  const load = useCallback(async (mode: LoadMode) => {
    if (mode === 'silent' && inFlightRef.current) return;
    inFlightRef.current = true;
    if (mode === 'initial') setIsLoading(true);
    if (mode === 'refresh') setIsRefreshing(true);

    try {
      const nextOrders = await fetchRestaurantOrders();
      if (!isMountedRef.current) return;
      setOrders(nextOrders);
      setErrorMessage('');
    } catch (error) {
      if (!isMountedRef.current) return;
      setErrorMessage(
        error instanceof RestaurantApiError
          ? error.message
          : 'Cannot reach the kitchen service. Check your connection and try again.',
      );
    } finally {
      inFlightRef.current = false;
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    load('initial');
    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  useEffect(() => {
    if (!poll) return undefined;
    const timer = setInterval(() => load('silent'), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load, poll]);

  const refresh = useCallback(() => load('refresh'), [load]);
  const retry = useCallback(() => load('initial'), [load]);

  const { awaiting, settled } = useMemo(() => splitRestaurantOrders(orders), [orders]);

  return { awaiting, settled, isLoading, isRefreshing, errorMessage, refresh, retry };
};
