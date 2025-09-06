import { useEffect, useState } from 'react';
import { useEmbeddedEthereumWallet } from '@privy-io/expo';
import { hyperliquidService } from '../services/HyperliquidService';

// hook for wallet signing operations with hyperliquid
export function useWalletSigning() {
  const { wallets } = useEmbeddedEthereumWallet();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // initialize wallet signing service with privy provider
    const initializeWalletSigning = async () => {
      try {
        if (wallets && wallets.length > 0) {
          const wallet = wallets[0];
          const provider = await wallet.getProvider();
          
          if (provider) {
            await hyperliquidService.setupSDK(provider);
            setIsReady(true);
            setError(null);
            console.log('Hyperliquid SDK initialized with provider');
          }
        } else {
          setIsReady(false);
        }
      } catch (err) {
        console.error('Failed to initialize wallet signing:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
        setIsReady(false);
      }
    };

    initializeWalletSigning();
  }, [wallets]);

  // sign and execute usdc transfer between spot and perp
  const signAndTransfer = async (amount: string, toPerp: boolean, hyperunitAddress?: string) => {
    if (!isReady) {
      throw new Error('Wallet signing not ready');
    }

    const { hyperliquidService } = await import('../services/HyperliquidService');
    const result = await hyperliquidService.transferBetweenAccounts(amount, toPerp, hyperunitAddress);
    console.log('[Hook] Transfer completed:', { amount, toPerp, hyperunitAddress }, result);
    
    return result;
  };

  // sign and place perpetual order
  const signAndPlaceOrder = async (orderParams: {
    coin: string;
    isBuy: boolean;
    size: string;
    price?: string;
    orderType: 'limit' | 'market';
    reduceOnly?: boolean;
    postOnly?: boolean;
  }) => {
    if (!isReady) {
      throw new Error('Wallet signing not ready');
    }

    const { hyperliquidService } = await import('../services/HyperliquidService');
    return await hyperliquidService.placeOrder(orderParams);
  };

  // sign and place spot order for token swaps
  const signAndPlaceSpotOrder = async (orderParams: {
    symbol: string;
    isBuy: boolean;
    usdValue?: string;
    solAmount?: string;
    slippageTolerance?: number;
    userAddress?: string;
  }) => {
    if (!isReady) {
      throw new Error('Wallet signing not ready');
    }

    const { hyperliquidService } = await import('../services/HyperliquidService');
    const result = await hyperliquidService.placeSpotOrder(orderParams);
    console.log('[Hook] Spot order completed:', orderParams, result);
    
    return result;
  };

  return {
    isReady,
    error,
    signAndTransfer,
    signAndPlaceOrder,
    signAndPlaceSpotOrder,
  };
}