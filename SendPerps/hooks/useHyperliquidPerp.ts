import { useState, useEffect, useCallback } from 'react';
import { hyperliquidService } from '../services/HyperliquidService';

// hook for user's perpetuals account summary
export function useUserPerpAccountSummary(userAddress?: string, dex?: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountSummary = useCallback(async () => {
    if (!userAddress) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await hyperliquidService.getUserPerpAccountSummary(userAddress, dex);
      setData(result);
    } catch (err) {
      console.error('fetch account summary failed:', err);
      setError(err instanceof Error ? err.message : 'failed to fetch account summary');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, dex]);

  useEffect(() => {
    fetchAccountSummary();
  }, [fetchAccountSummary]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAccountSummary,
  };
}

// hook for user's open orders
export function useUserOpenOrders(userAddress?: string, dex?: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpenOrders = useCallback(async () => {
    if (!userAddress) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await hyperliquidService.getUserOpenOrders(userAddress, dex);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('fetch open orders failed:', err);
      setError(err instanceof Error ? err.message : 'failed to fetch open orders');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, dex]);

  useEffect(() => {
    fetchOpenOrders();
  }, [fetchOpenOrders]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOpenOrders,
  };
}

// combined hook for both perp account data and open orders
export function useHyperliquidPerpData(userAddress?: string, dex?: string) {
  const accountSummary = useUserPerpAccountSummary(userAddress, dex);
  const openOrders = useUserOpenOrders(userAddress, dex);

  const isLoading = accountSummary.isLoading || openOrders.isLoading;
  const hasError = accountSummary.error || openOrders.error;

  const refetchAll = useCallback(() => {
    accountSummary.refetch();
    openOrders.refetch();
  }, [accountSummary.refetch, openOrders.refetch]);

  return {
    accountSummary: {
      data: accountSummary.data,
      isLoading: accountSummary.isLoading,
      error: accountSummary.error,
    },
    openOrders: {
      data: openOrders.data,
      isLoading: openOrders.isLoading,
      error: openOrders.error,
    },
    isLoading,
    hasError,
    refetchAll,
  };
}