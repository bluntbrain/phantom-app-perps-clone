import { WalletClient, HttpTransport, PublicClient } from '@nktkas/hyperliquid';
import { createWalletClient, custom } from 'viem';

export interface WalletProvider {
  request(params: { method: string; params?: any[] }): Promise<any>;
}

export class HyperliquidSDKService {
  private provider: WalletProvider | null = null;
  private walletClient: WalletClient | null = null;
  private publicClient: PublicClient | null = null;

  constructor() {
    this.publicClient = new PublicClient({
      transport: new HttpTransport()
    });
  }

  public async setProvider(provider: WalletProvider) {
    this.provider = provider;
    
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No wallet accounts available');
    }

    const account = accounts[0];
    
    const viemWallet = createWalletClient({
      account,
      transport: custom({
        request: async ({ method, params }: { method: string; params?: any[] }) => {
          return await provider.request({ method, params });
        }
      })
    });

    this.walletClient = new WalletClient({
      wallet: viemWallet,
      transport: new HttpTransport(),
    });

    console.log('sdk client initialized with account:', account);
  }

  public async getAddress(): Promise<string> {
    if (!this.provider) {
      throw new Error('Wallet provider not initialized');
    }

    const accounts = await this.provider.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No wallet accounts available');
    }

    return accounts[0];
  }

  public async spotUser(params: { 
    toggleSpotDusting: { optOut: boolean }; 
  }): Promise<any> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const result = await this.walletClient.spotUser(params);
      return result;
    } catch (error) {
      console.error('spot user failed:', error);
      throw error;
    }
  }

  public async usdClassTransfer(params: {
    amount: string;
    toPerp: boolean;
  }): Promise<any> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const result = await this.walletClient.usdClassTransfer(params);
      return result;
    } catch (error) {
      console.error('usd class transfer failed:', error);
      throw error;
    }
  }

  public async order(params: {
    orders: Array<{
      a: number;
      b: boolean;
      p: string;
      s: string;
      r: boolean;
      t: {
        limit: {
          tif: "Gtc" | "Ioc" | "Alo";
        }
      }
    }>;
    grouping: "na" | "normalTpsl" | "positionTpsl";
  }): Promise<any> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const result = await this.walletClient.order(params);
      return result;
    } catch (error) {
      console.error('order failed:', error);
      throw error;
    }
  }

  public async cancel(params: {
    cancels: Array<{
      a: number;
      o: number;
    }>;
  }): Promise<any> {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized');
    }

    try {
      const result = await this.walletClient.cancel(params);
      return result;
    } catch (error) {
      console.error('cancel failed:', error);
      throw error;
    }
  }

  public async getSpotMetaAndAssetCtxs(): Promise<any> {
    if (!this.publicClient) {
      throw new Error('Public client not initialized');
    }

    try {
      const result = await this.publicClient.spotMetaAndAssetCtxs();
      return result;
    } catch (error) {
      console.error('spot meta failed:', error);
      throw error;
    }
  }


  public async findSpotAssetWithTickSize(symbol: string): Promise<{
    assetIndex: number;
    spotAssetIndex: number;
    priceDecimals: number;
    sizeDecimals: number;
    currentPrice: number;
  }> {
    const [spotMeta, assetCtxs] = await this.getSpotMetaAndAssetCtxs();
    
    let assetIndex = spotMeta.universe.findIndex((asset: any) => asset.name === symbol);
    
    if (assetIndex === -1 && (symbol === 'SOL/USDC' || symbol === 'USOL/USDC')) {
      const usdcToken = spotMeta.tokens.find((token: any) => token.name === 'USDC');
      const usolToken = spotMeta.tokens.find((token: any) => token.name === 'USOL');
      
      if (usdcToken && usolToken) {
        assetIndex = spotMeta.universe.findIndex((asset: any) => {
          return asset.tokens.includes(usolToken.index) && asset.tokens.includes(usdcToken.index);
        });
      }
    }
    
    if (assetIndex === -1) {
      const availablePairs = spotMeta.universe.map((asset: any) => asset.name).join(', ');
      throw new Error(`Spot asset ${symbol} not found. Available pairs: ${availablePairs}`);
    }
    
    const foundAsset = spotMeta.universe[assetIndex];
    const spotAssetIndex = 10000 + foundAsset.index;
    let currentPrice: number;
    
    if (symbol === 'USOL/USDC') {
      try {
        const response = await fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'metaAndAssetCtxs' })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const [perpsMeta, perpsCtxs] = await response.json();
        
        const solIndex = perpsMeta.universe.findIndex((asset: any) => asset.name === 'SOL');
        if (solIndex !== -1 && perpsCtxs[solIndex]) {
          currentPrice = parseFloat(perpsCtxs[solIndex].markPx || perpsCtxs[solIndex].midPx || '0');
          console.log('using sol perps price for usol:', currentPrice);
        } else {
          throw new Error('SOL perps price not available');
        }
      } catch (error) {
        console.warn('could not get sol perps price, falling back:', error);
        const assetCtx = assetCtxs[assetIndex];
        if (!assetCtx) {
          throw new Error(`Price data for ${symbol} not available at index ${assetIndex}`);
        }
        currentPrice = parseFloat(assetCtx.markPx || assetCtx.midPx || '0');
      }
    } else {
      const assetCtx = assetCtxs[assetIndex];
      if (!assetCtx) {
        throw new Error(`Price data for ${symbol} not available at index ${assetIndex}`);
      }
      currentPrice = parseFloat(assetCtx.markPx || assetCtx.midPx || '0');
    }
    
    if (currentPrice <= 0) {
      throw new Error('Unable to get current price');
    }
    
    // For USOL/USDC pair, find both tokens to determine proper decimals
    const baseTokenIndex = foundAsset.tokens[0];
    
    const baseToken = spotMeta.tokens.find((token: any) => token.index === baseTokenIndex);
    
    const baseSzDecimals = baseToken ? baseToken.szDecimals : 3;
    const sizeDecimals = baseSzDecimals;
    
    let priceDecimals: number;
    if (symbol === 'USOL/USDC') {
      priceDecimals = 2;
    } else if (currentPrice >= 1000) {
      priceDecimals = 1;
    } else if (currentPrice >= 100) {
      priceDecimals = 2;
    } else if (currentPrice >= 1) {
      priceDecimals = 3;
    } else {
      priceDecimals = Math.min(5, Math.max(2, baseSzDecimals));
    }
    
    return {
      assetIndex,
      spotAssetIndex,
      priceDecimals,
      sizeDecimals,
      currentPrice
    };
  }

  public formatPriceWithDecimals(price: number, priceDecimals: number): string {
    return price.toFixed(priceDecimals);
  }
  
  public formatSizeWithDecimals(size: number, sizeDecimals: number): string {
    return size.toFixed(sizeDecimals);
  }
}

export const hyperliquidSDKService = new HyperliquidSDKService();