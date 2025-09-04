import { useState, useEffect } from 'react';
import { hyperliquidService } from '../services/HyperliquidService';

export function useSolanaPrice() {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolPrice = async () => {
      try {
        setLoading(true);
        const currentPrice = await hyperliquidService.getCurrentPrice('SOL');
        setPrice(currentPrice);
      } catch (error) {
        console.error('Failed to fetch SOL price:', error);
        // Fallback to reasonable default
        setPrice(150.0);
      } finally {
        setLoading(false);
      }
    };

    fetchSolPrice();

    // Update price every 30 seconds
    const interval = setInterval(fetchSolPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const getUsdcValue = (solAmount: string) => {
    const amount = parseFloat(solAmount) || 0;
    const usdcValue = amount * price;

    // Format based on size
    if (usdcValue >= 10000) {
      return usdcValue.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } else if (usdcValue >= 100) {
      return usdcValue.toFixed(0);
    } else {
      return usdcValue.toFixed(2);
    }
  };

  return {
    solPrice: price,
    loadingPrice: loading,
    getUsdcValue,
  };
}