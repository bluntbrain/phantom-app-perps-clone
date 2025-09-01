export interface PerpsData {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  leverage: string;
  volume: string;
  iconUrl?: string;
}

export interface HyperliquidPosition {
  coin: string;
  size: string;
  entryPx: string;
  pnl: string;
  unrealizedPnl: string;
  isLong: boolean;
}

export interface HyperliquidBalance {
  totalValue: string;
  availableBalance: string;
}

interface MetaResponse {
  universe: Array<{
    name: string;
    szDecimals: number;
    maxLeverage: number;
    onlyIsolated?: boolean;
    isDelisted?: boolean;
  }>;
  marginTables: Array<[number, any]>;
}

interface AssetContext {
  dayNtlVlm: string;
  funding: string;
  impactPxs: [string, string];
  markPx: string;
  midPx: string;
  openInterest: string;
  oraclePx: string;
  premium: string;
  prevDayPx: string;
}

export class HyperliquidService {
  private baseUrl: string;
  private websocketUrl: string;

  constructor() {
    console.log('[HyperliquidService] Constructor called - DIRECT API VERSION - using real Hyperliquid API');
    this.baseUrl = 'https://api.hyperliquid.xyz';
    this.websocketUrl = 'wss://api.hyperliquid.xyz/ws';
  }

  /**
   * Initialize wallet for trading operations
   */
  public initializeWallet(walletAddress: string) {
    console.log('[HyperliquidService] Wallet initialized for address:', walletAddress?.substring(0, 10) + '...');
    console.log('[HyperliquidService] Ready for direct API calls');
  }

  /**
   * Make API call to Hyperliquid info endpoint
   */
  private async apiCall(requestBody: any): Promise<any> {
    try {
      console.log('[HyperliquidService] Making API call:', requestBody.type);
      
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[HyperliquidService] API response received for:', requestBody.type);
      return data;
    } catch (error) {
      console.error('[HyperliquidService] API call failed:', error);
      throw error;
    }
  }

  /**
   * Get perpetuals metadata
   */
  private async getMeta(): Promise<MetaResponse> {
    return await this.apiCall({ type: 'meta' });
  }

  /**
   * Get perpetuals metadata and asset contexts (includes prices, volume, etc.)
   */
  private async getMetaAndAssetCtxs(): Promise<[MetaResponse, AssetContext[]]> {
    return await this.apiCall({ type: 'metaAndAssetCtxs' });
  }

  /**
   * Get real perps data from Hyperliquid
   */
  public async getPerpsData(): Promise<PerpsData[]> {
    try {
      console.log('[HyperliquidService] Fetching real perps data from Hyperliquid API...');
      
      // Get metadata and asset contexts in one call
      const [meta, assetCtxs] = await this.getMetaAndAssetCtxs();
      
      console.log('[HyperliquidService] Received data:', {
        universeCount: meta.universe.length,
        assetCtxsCount: assetCtxs.length
      });

      // Transform API data to our PerpsData format
      const perpsData: PerpsData[] = meta.universe
        .map((asset, index) => {
          const assetCtx = assetCtxs[index];
          
          if (!assetCtx || asset.isDelisted) {
            return null;
          }

          const volume = parseFloat(assetCtx.dayNtlVlm);
          const formattedVolume = this.formatVolume(volume);
          
          console.log(`[HyperliquidService] Processing ${asset.name}:`, {
            markPrice: assetCtx.markPx,
            volume: formattedVolume,
            maxLeverage: asset.maxLeverage
          });

          const item: PerpsData = {
            id: (index + 1).toString(),
            rank: index + 1,
            symbol: `${asset.name}-USD`,
            name: this.getAssetName(asset.name),
            leverage: `${asset.maxLeverage}x`,
            volume: formattedVolume,
            iconUrl: this.getCoinIcon(asset.name),
          };
          return item;
        })
        .filter((item): item is PerpsData => item !== null);

      console.log('[HyperliquidService] Real perps data processed:', {
        totalCount: perpsData.length,
        firstItem: perpsData[0]?.symbol
      });

      return perpsData;
    } catch (error) {
      console.error('[HyperliquidService] Failed to fetch real perps data:', error);
      throw error;
    }
  }

  /**
   * Get user's portfolio balance
   */
  public async getUserBalance(userAddress: string): Promise<HyperliquidBalance> {
    try {
      console.log('[HyperliquidService] Fetching user balance for:', userAddress.substring(0, 10) + '...');
      
      const clearinghouseState = await this.apiCall({
        type: 'clearinghouseState',
        user: userAddress
      });

      console.log('[HyperliquidService] User balance received:', {
        accountValue: clearinghouseState.marginSummary.accountValue,
        withdrawable: clearinghouseState.withdrawable
      });

      return {
        totalValue: clearinghouseState.marginSummary.accountValue,
        availableBalance: clearinghouseState.withdrawable,
      };
    } catch (error) {
      console.error('[HyperliquidService] Failed to fetch user balance:', error);
      return {
        totalValue: '0',
        availableBalance: '0',
      };
    }
  }

  /**
   * Get user's open positions
   */
  public async getUserPositions(userAddress: string): Promise<HyperliquidPosition[]> {
    try {
      console.log('[HyperliquidService] Fetching user positions for:', userAddress.substring(0, 10) + '...');
      
      const clearinghouseState = await this.apiCall({
        type: 'clearinghouseState',
        user: userAddress
      });

      const positions = clearinghouseState.assetPositions.map((position: any) => ({
        coin: position.position.coin,
        size: position.position.szi,
        entryPx: position.position.entryPx || '0',
        pnl: position.position.unrealizedPnl,
        unrealizedPnl: position.position.unrealizedPnl,
        isLong: parseFloat(position.position.szi) > 0,
      }));

      console.log('[HyperliquidService] User positions received:', positions.length, 'positions');
      return positions;
    } catch (error) {
      console.error('[HyperliquidService] Failed to fetch user positions:', error);
      return [];
    }
  }

  /**
   * Get current price for a specific asset
   */
  public async getCurrentPrice(coin: string): Promise<number> {
    try {
      console.log('[HyperliquidService] Fetching current price for:', coin);
      
      // Get asset contexts which includes current prices
      const [, assetCtxs] = await this.getMetaAndAssetCtxs();
      const meta = await this.getMeta();
      
      // Find the asset index
      const assetIndex = meta.universe.findIndex(asset => asset.name === coin);
      if (assetIndex === -1) {
        throw new Error(`Asset ${coin} not found`);
      }

      const assetCtx = assetCtxs[assetIndex];
      if (!assetCtx) {
        throw new Error(`Price data for ${coin} not available`);
      }

      const price = parseFloat(assetCtx.markPx);
      console.log('[HyperliquidService] Current price for', coin + ':', price);
      
      return price;
    } catch (error) {
      console.error('[HyperliquidService] Failed to fetch current price for', coin + ':', error);
      return 0;
    }
  }

  /**
   * Get L2 order book data
   */
  public async getOrderBook(coin: string) {
    try {
      return await this.apiCall({ type: 'l2Book', coin });
    } catch (error) {
      console.error('[HyperliquidService] Failed to fetch order book for', coin + ':', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   */
  public subscribeToPrice(coin: string, callback: (price: number) => void): WebSocket | null {
    try {
      console.log('[HyperliquidService] Connecting to WebSocket for', coin, 'price updates...');
      
      const ws = new WebSocket(this.websocketUrl);
      
      ws.onopen = () => {
        console.log('[HyperliquidService] WebSocket connected for', coin);
        
        // Subscribe to trades for real-time price updates
        const subscription = {
          method: 'subscribe',
          subscription: {
            type: 'trades',
            coin: coin
          }
        };
        
        ws.send(JSON.stringify(subscription));
        console.log('[HyperliquidService] Subscribed to trades for', coin);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.channel === 'trades' && data.data && data.data.length > 0) {
            const latestTrade = data.data[data.data.length - 1];
            const price = parseFloat(latestTrade.px);
            
            console.log('[HyperliquidService] Price update for', coin + ':', price);
            
            if (price > 0) {
              callback(price);
            }
          }
        } catch (error) {
          console.error('[HyperliquidService] Error processing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[HyperliquidService] WebSocket error for', coin + ':', error);
      };

      ws.onclose = () => {
        console.log('[HyperliquidService] WebSocket closed for', coin);
      };

      return ws;
    } catch (error) {
      console.error('[HyperliquidService] Failed to subscribe to price updates for', coin + ':', error);
      return null;
    }
  }

  /**
   * Subscribe to candle/chart data via WebSocket  
   */
  public subscribeToCandles(coin: string, interval: string, callback: (candle: any) => void): WebSocket | null {
    try {
      console.log('[HyperliquidService] Connecting to WebSocket for', coin, 'candle data...');
      
      const ws = new WebSocket(this.websocketUrl);
      
      ws.onopen = () => {
        console.log('[HyperliquidService] WebSocket connected for', coin, 'candle');
        
        // Subscribe to candle for chart data (note: "candle" not "candles")
        const subscription = {
          method: 'subscribe',
          subscription: {
            type: 'candle',
            coin: coin,
            interval: interval
          }
        };
        
        ws.send(JSON.stringify(subscription));
        console.log('[HyperliquidService] Subscribed to candle for', coin, 'interval:', interval);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          console.log('[HyperliquidService] Candle WebSocket message:', {
            channel: data.channel,
            hasData: !!data.data,
            dataType: typeof data.data
          });
          
          if (data.channel === 'candle' && data.data) {
            callback(data.data);
          } else if (data.channel === 'subscriptionResponse') {
            console.log('[HyperliquidService] Candle subscription confirmed for', coin);
          } else if (data.channel === 'error') {
            console.error('[HyperliquidService] Candle subscription error:', data.data);
          }
        } catch (error) {
          console.error('[HyperliquidService] Error processing candle WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[HyperliquidService] Candle WebSocket error for', coin + ':', error);
      };

      ws.onclose = () => {
        console.log('[HyperliquidService] Candle WebSocket closed for', coin);
      };

      return ws;
    } catch (error) {
      console.error('[HyperliquidService] Failed to subscribe to candle for', coin + ':', error);
      return null;
    }
  }

  // TODO: Implement trading methods when needed
  // For now, we're focusing on data fetching and WebSocket connections

  /**
   * Format volume for display
   */
  private formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(0)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(0)}K`;
    } else {
      return `$${volume.toFixed(0)}`;
    }
  }

  /**
   * Get coin icon URL from CoinGecko API
   */
  private getCoinIcon(symbol: string): string | undefined {
    const iconMappings: { [key: string]: string } = {
      'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
      'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
      'SOL': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
      'DOGE': 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
      'XRP': 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png',
      'ADA': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
      'AVAX': 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
      'MATIC': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
      'DOT': 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
      'UNI': 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
      'LINK': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
      'ATOM': 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
      'HYPE': 'https://assets.coingecko.com/coins/images/34019/small/hyperliquid.png',
      'LTC': 'https://assets.coingecko.com/coins/images/2/small/litecoin.png',
      'BCH': 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png',
      'NEAR': 'https://assets.coingecko.com/coins/images/10365/small/near_icon.png',
      'FTM': 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png',
      'ALGO': 'https://assets.coingecko.com/coins/images/4380/small/download.png',
      'ICP': 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
      'VET': 'https://assets.coingecko.com/coins/images/1167/small/VeChain-Logo-768x725.png',
      'TRX': 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png',
      'ETC': 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png',
      'XLM': 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png',
      'AAVE': 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
      'MKR': 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png',
      'COMP': 'https://assets.coingecko.com/coins/images/10775/small/COMP.png',
      'SUSHI': 'https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png',
      'YFI': 'https://assets.coingecko.com/coins/images/11849/small/yfi-192x192.png',
      'SNX': 'https://assets.coingecko.com/coins/images/3406/small/SNX.png',
      '1INCH': 'https://assets.coingecko.com/coins/images/13469/small/1inch-token.png',
      'CRV': 'https://assets.coingecko.com/coins/images/12124/small/Curve.png',
    };
    
    return iconMappings[symbol];
  }

  /**
   * Get human-readable asset name
   */
  private getAssetName(symbol: string): string {
    const names: { [key: string]: string } = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum', 
      'SOL': 'Solana',
      'DOGE': 'Dogecoin',
      'XRP': 'Ripple',
      'ADA': 'Cardano',
      'AVAX': 'Avalanche',
      'MATIC': 'Polygon',
      'DOT': 'Polkadot',
      'UNI': 'Uniswap',
      'LINK': 'Chainlink',
      'ATOM': 'Cosmos',
      'HYPE': 'Hyperliquid',
    };
    return names[symbol] || symbol;
  }
}

// Export singleton instance
export const hyperliquidService = new HyperliquidService();