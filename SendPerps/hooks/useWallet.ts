import { usePrivy } from "@privy-io/expo";
import { useState, useEffect, useCallback } from "react";

interface WalletData {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
}

export function useWallet(): WalletData {
  const { user } = usePrivy();
  const [walletData, setWalletData] = useState<WalletData>({
    address: null,
    isConnected: false,
    isLoading: true,
  });

  useEffect(() => {
    if (user) {
      console.log("[useWallet] All linked accounts:", user.linked_accounts?.map(acc => ({ 
        type: acc.type, 
        address: (acc as any).address?.substring?.(0, 10),
        wallet_client_type: (acc as any).wallet_client_type 
      })));

      // Find specifically wallet accounts (not email or other account types)
      const walletAccount = user.linked_accounts?.find(
        (account: any) => 
          (account.type === "wallet" || account.type === "smart_wallet") &&
          "address" in account
      );

      console.log("[useWallet] Found wallet account:", walletAccount ? {
        type: walletAccount.type,
        address: (walletAccount as any).address?.substring?.(0, 10),
        wallet_client_type: (walletAccount as any).wallet_client_type
      } : null);

      if (walletAccount && "address" in walletAccount) {
        console.log("[useWallet] Using primary wallet address:", (walletAccount as any).address?.substring?.(0, 10));
        setWalletData({
          address: walletAccount.address as string,
          isConnected: true,
          isLoading: false,
        });
      } else {
        // Try to find embedded wallet (for backward compatibility)
        const embeddedWallet = user.linked_accounts?.find(
          (account: any) => 
            account.type === "wallet" && 
            account.wallet_client_type === "privy" &&
            "address" in account
        );
        
        console.log("[useWallet] Found embedded wallet:", embeddedWallet ? {
          type: embeddedWallet.type,
          address: (embeddedWallet as any).address?.substring?.(0, 10),
          wallet_client_type: (embeddedWallet as any).wallet_client_type
        } : null);

        if (embeddedWallet && "address" in embeddedWallet) {
          console.log("[useWallet] Using embedded wallet address:", (embeddedWallet as any).address?.substring?.(0, 10));
          setWalletData({
            address: embeddedWallet.address as string,
            isConnected: true,
            isLoading: false,
          });
        } else {
          console.log("[useWallet] No wallet found");
          setWalletData({
            address: null,
            isConnected: false,
            isLoading: false,
          });
        }
      }
    } else {
      setWalletData({
        address: null,
        isConnected: false,
        isLoading: false,
      });
    }
  }, [user]);

  return walletData;
}

export function useWalletBalance() {
  const { address } = useWallet();
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [spotBalance, setSpotBalance] = useState(0);
  const [usolBalance, setUsolBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setBalance(0);
      setAvailableBalance(0);
      setSpotBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      const { hyperliquidService } = await import("../services/HyperliquidService");
      
      // Fetch both perp and spot balances
      const [perpBalanceData, spotBalances] = await Promise.all([
        hyperliquidService.getUserBalance(address),
        hyperliquidService.getSpotBalance(address)
      ]);
      
      // Perp balance - use total account value for display, available for trading
      const perpTotalValue = parseFloat(perpBalanceData.totalValue) || 0;
      const perpAvailable = parseFloat(perpBalanceData.availableBalance) || 0;
      setBalance(perpTotalValue);
      setAvailableBalance(perpAvailable);
      
      // Process individual token balances
      let totalSpotValue = 0;
      let usdc = 0;
      let usol = 0;
      
      if (spotBalances && Array.isArray(spotBalances)) {
        spotBalances.forEach(tokenBalance => {
          if (tokenBalance.coin === 'USDC') {
            // USDC is 1:1 with USD
            const usdcAmount = parseFloat(tokenBalance.total) || 0;
            usdc = usdcAmount;
            totalSpotValue += usdcAmount;
          } else if (tokenBalance.coin === 'USOL') {
            // USOL (wrapped SOL) - store token amount and add USD value
            const usolTokenAmount = parseFloat(tokenBalance.total) || 0;
            const usdValue = parseFloat(tokenBalance.entryNtl) || 0;
            console.log(`USOL balance: ${usolTokenAmount} USOL = $${usdValue}`);
            usol = usolTokenAmount;
            totalSpotValue += usdValue;
          }
        });
      }
      
      setUsdcBalance(usdc);
      setUsolBalance(usol);
      setSpotBalance(totalSpotValue);
      
    } catch (error) {
      console.error("Balance fetch error:", error);
      setBalance(0);
      setAvailableBalance(0);
      setSpotBalance(0);
      setUsdcBalance(0);
      setUsolBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchBalances();
  }, [fetchBalances]);

  return { 
    balance, // Perp balance total account value (USDC)
    availableBalance, // Perp balance available for trading (USDC)
    spotBalance, // Spot balance total (USD value)
    usdcBalance, // USDC balance (individual token)
    usolBalance, // USOL balance (individual token amount)
    totalBalance: balance + spotBalance, // Combined total
    isLoading,
    refetch
  };
}