import { 
  PerpsData, 
  HyperliquidPosition, 
  HyperliquidBalance,
  HyperliquidSpotBalance,
  MetaResponse,
  AssetContext,
  CandleData
} from '../types/hyperliquid';
import { formatVolume } from '../utils/formatting';
import { getCoinIcon, getAssetName, getIntervalMs } from '../utils/crypto';

export { 
  PerpsData, 
  HyperliquidPosition, 
  HyperliquidBalance,
  HyperliquidSpotBalance,
  CandleData 
};

export class HyperliquidService {
  private baseUrl: string;
  private websocketUrl: string;
  private priceConnections: Map<string, WebSocket> = new Map();
  private candleConnections: Map<string, WebSocket> = new Map();
  private candleCallbacks: Map<string, (candle: CandleData, isSnapshot?: boolean, index?: number, total?: number) => void> = new Map();
  constructor() {
    // Always use mainnet endpoints
    this.baseUrl = 'https://api.hyperliquid.xyz';
    this.websocketUrl = 'wss://api.hyperliquid.xyz/ws';
    console.log('HyperliquidService initialized with MAINNET', this.baseUrl);
  }




  // api call
  private async apiCall(requestBody: any): Promise<any> {
    try {
      
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
      return data;
    } catch (error) {
      console.error('api call failed:', error);
      throw error;
    }
  }

  // get metadata
  private async getMeta(): Promise<MetaResponse> {
    return await this.apiCall({ type: 'meta' });
  }

  // get meta and contexts
  private async getMetaAndAssetCtxs(): Promise<[MetaResponse, AssetContext[]]> {
    return await this.apiCall({ type: 'metaAndAssetCtxs' });
  }

  // get perps data
  public async getPerpsData(): Promise<PerpsData[]> {
    try {
      // get meta and contexts
      const [meta, assetCtxs] = await this.getMetaAndAssetCtxs();      // transform to perps format
      const perpsData: PerpsData[] = meta.universe
        .map((asset, index) => {
          const assetCtx = assetCtxs[index];
          
          if (!assetCtx || asset.isDelisted) {
            return null;
          }

          const volume = parseFloat(assetCtx.dayNtlVlm);
          const formattedVolume = formatVolume(volume);
          const item: PerpsData = {
            id: (index + 1).toString(),
            rank: index + 1,
            symbol: `${asset.name}-USD`,
            name: getAssetName(asset.name),
            leverage: `${asset.maxLeverage}x`,
            volume: formattedVolume,
            iconUrl: getCoinIcon(asset.name),
          };
          return item;
        })
        .filter((item): item is PerpsData => item !== null);      return perpsData;
    } catch (error) {
      console.error('failed to fetch perps:', error);
      throw error;
    }
  }

  // get user balance
  public async getUserBalance(userAddress: string): Promise<HyperliquidBalance> {
    try {
      const requestBody = {
        type: 'clearinghouseState',
        user: userAddress
      };
      console.log('Fetching balance:', { address: userAddress, type: 'clearinghouseState' });
      
      const clearinghouseState = await this.apiCall(requestBody);
      
      
      // Extract key values
      const marginSummary = clearinghouseState.marginSummary || {};
      const accountValue = marginSummary.accountValue || '0';
      const withdrawable = clearinghouseState.withdrawable || '0';
      
      console.log('Account summary:', { 
        value: accountValue, 
        available: withdrawable,
        marginUsed: marginSummary.totalMarginUsed || '0',
        positionValue: marginSummary.totalNtlPos || '0'
      });
      
      // Check if there are any positions
      if (clearinghouseState.assetPositions && clearinghouseState.assetPositions.length > 0) {
        console.log('Active Positions:', clearinghouseState.assetPositions.length);
        clearinghouseState.assetPositions.forEach((pos: any, index: number) => {
          console.log(`Position ${index + 1}:`, {
            coin: pos.position?.coin,
            size: pos.position?.szi,
            entryPrice: pos.position?.entryPx,
            unrealizedPnl: pos.position?.unrealizedPnl
          });
        });
      } else {
        console.log('No active positions');
      }
      
      
      return {
        totalValue: accountValue,
        availableBalance: withdrawable,
      };
    } catch (error) {
      console.error('=== BALANCE FETCH ERROR ===');
      console.error('Failed to fetch balance for address:', userAddress);
      console.error('Error details:', error);
      return {
        totalValue: '0',
        availableBalance: '0',
      };
    }
  }

  // get spot balance
  public async getSpotBalance(userAddress: string): Promise<HyperliquidSpotBalance[]> {
    try {
      const requestBody = {
        type: 'spotClearinghouseState',
        user: userAddress
      };
      console.log('Fetching spot balance:', { address: userAddress, type: 'spotClearinghouseState' });
      
      const spotState = await this.apiCall(requestBody);
      
      if (spotState && spotState.balances) {
        console.log('Spot balances:', spotState.balances);
        return spotState.balances;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch spot balance for address:', userAddress);
      console.error('Spot balance error:', error);
      return [];
    }
  }

  // get positions
  public async getUserPositions(userAddress: string): Promise<HyperliquidPosition[]> {
    try {
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
      }));      return positions;
    } catch (error) {
      console.error('failed to fetch positions:', error);
      return [];
    }
  }

  // get price
  public async getCurrentPrice(coin: string): Promise<number> {
    try {
      // get contexts with prices
      const [, assetCtxs] = await this.getMetaAndAssetCtxs();
      const meta = await this.getMeta();
      // find asset
      const assetIndex = meta.universe.findIndex(asset => asset.name === coin);
      if (assetIndex === -1) {
        throw new Error(`Asset ${coin} not found`);
      }

      const assetCtx = assetCtxs[assetIndex];
      if (!assetCtx) {
        throw new Error(`Price data for ${coin} not available`);
      }      const price = parseFloat(assetCtx.markPx);
      return price;
    } catch (error) {
      console.error('failed to fetch price:', coin, error);
      return 0;
    }
  }

  // fetch candle history
  public async getCandleSnapshot(coin: string, interval: string, startTime?: number, endTime?: number): Promise<CandleData[]> {
    try {
      // calc time range (50 candles)
      const now = Date.now();
      const intervalMs = getIntervalMs(interval);
      const candleCount = 50;
      
      if (!endTime) {
        endTime = now;
      }
      if (!startTime) {
        startTime = endTime - (intervalMs * candleCount);
      }
      
      const requestBody = {
        type: 'candleSnapshot',
        req: {
          coin: coin,
          interval: interval,
          startTime: startTime,
          endTime: endTime
        }
      };
      
      const response = await this.apiCall(requestBody);
      if (Array.isArray(response)) {
        // convert to candle format
        const candles: CandleData[] = response.map((candle: any) => ({
          timestamp: candle.t || candle.T || Date.now(),
          open: parseFloat(candle.o || '0'),
          high: parseFloat(candle.h || '0'),
          low: parseFloat(candle.l || '0'),
          close: parseFloat(candle.c || '0'),
          volume: parseFloat(candle.v || '0')
        }));
        // sort by time
        candles.sort((a, b) => a.timestamp - b.timestamp);
        
        return candles;
      }
      return [];
    } catch (error) {
      console.error('candle fetch error:', error);
      return [];
    }
  }
  

  // price ws subscription
  public subscribeToPrice(coin: string, callback: (price: number) => void): void {
    try {
      // close existing
      this.unsubscribeFromPrice(coin);

      const ws = new WebSocket(this.websocketUrl);
      let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
      
      ws.onopen = () => {
        const subscription = {
          method: 'subscribe',
          subscription: {
            type: 'trades',
            coin: coin
          }
        };
        ws.send(JSON.stringify(subscription));
        // heartbeat - ping every 30s to keep ws alive
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.channel === 'subscriptionResponse') {
            // confirmed
          } else if (data.channel === 'trades' && data.data && data.data.length > 0) {
            const latestTrade = data.data[data.data.length - 1];
            const price = parseFloat(latestTrade.px);
            if (price > 0) {
              callback(price);
            }
          } else if (data.channel === 'error') {
            console.error('price ws error:', data.data);
          }
        } catch (error) {
          console.error('price msg error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('price ws error:', coin, error);
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
      };

      ws.onclose = (event) => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        this.priceConnections.delete(coin);
      };

      this.priceConnections.set(coin, ws);
      
    } catch (error) {
      console.error('price ws create failed:', coin, error);
    }
  }

  // unsubscribe price
  public unsubscribeFromPrice(coin: string): void {
    const ws = this.priceConnections.get(coin);
    if (ws) {
      ws.close();
      this.priceConnections.delete(coin);
    }
  }

  // candle ws subscription
  public subscribeToCandles(
    coin: string, 
    interval: string, 
    callback: (candle: CandleData, isSnapshot?: boolean, index?: number, total?: number) => void
  ): void {
    try {
      const callbackKey = `${coin}-${interval}`;
      // store callback first
      this.candleCallbacks.set(callbackKey, callback);
      // check existing
      const existingWs = this.candleConnections.get(coin);
      if (existingWs && existingWs.readyState === WebSocket.OPEN) {
        // reuse connection
        return;
      }
      // close if not open
      if (existingWs) {
        existingWs.close();
        this.candleConnections.delete(coin);
      }

      const ws = new WebSocket(this.websocketUrl);
      let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
      
      ws.onopen = () => {
        
        const subscription = {
          method: 'subscribe',
          subscription: {
            type: 'candle',
            coin: coin,
            interval: interval
          }
        };
        
        ws.send(JSON.stringify(subscription));
        // heartbeat - ping every 30s to keep ws alive
        heartbeatInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.channel === 'subscriptionResponse') {
            // confirmed
          } else if (data.channel === 'candle') {
            if (!data.data) {
              return;
            }
            
            const isSnapshot = data.isSnapshot || false;
            // handle array or single
            const candles = Array.isArray(data.data) ? data.data : [data.data];
            
            candles.forEach((candle: any, index: number) => {
              if (candle && typeof candle === 'object') {
                try {
                  const processedCandle: CandleData = {
                    timestamp: candle.t || candle.timestamp || Date.now(),
                    open: parseFloat(String(candle.o || candle.open || '0')),
                    high: parseFloat(String(candle.h || candle.high || '0')),
                    low: parseFloat(String(candle.l || candle.low || '0')),
                    close: parseFloat(String(candle.c || candle.close || '0')),
                    volume: parseFloat(String(candle.v || candle.volume || '0')),
                  };
                  // validate
                  if (isNaN(processedCandle.open) || isNaN(processedCandle.close) || 
                      processedCandle.open <= 0 || processedCandle.close <= 0) {
                    return;
                  }
                  // call callback
                  const storedCallback = this.candleCallbacks.get(callbackKey);
                  if (storedCallback) {
                    storedCallback(processedCandle, isSnapshot, index, candles.length);
                  }
                } catch (error) {
                  console.error('candle process error:', error);
                }
              } else {
              }
            });
          } else if (data.channel === 'error') {
            console.error('candle ws error:', data.data);
          }
        } catch (error) {
          console.error('ws msg error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('candle ws error:', coin, error);
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
      };

      ws.onclose = (event) => {
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval);
        }
        this.candleConnections.delete(coin);
      };

      this.candleConnections.set(coin, ws);
      
    } catch (error) {
      console.error('candle ws create failed:', coin, error);
    }
  }

  // unsubscribe candles
  public unsubscribeFromCandles(coin: string): void {
    const ws = this.candleConnections.get(coin);
    if (ws) {
      ws.close();
      this.candleConnections.delete(coin);
    }
    // keep callbacks for re-renders
  }

  // clear callback
  public clearCandleCallback(coin: string, interval: string): void {
    const callbackKey = `${coin}-${interval}`;
    if (this.candleCallbacks.has(callbackKey)) {
      this.candleCallbacks.delete(callbackKey);
    }
  }

  // close all
  public closeAllConnections(): void {
    this.priceConnections.forEach((ws, coin) => {
      ws.close();
    });
    this.priceConnections.clear();

    this.candleConnections.forEach((ws, coin) => {
      ws.close();
    });
    this.candleConnections.clear();
  }

  // get order book
  public async getOrderBook(coin: string) {
    try {
      return await this.apiCall({ type: 'l2Book', coin });
    } catch (error) {
      console.error('order book failed:', coin, error);
      return null;
    }
  }

}

// singleton - using MAINNET only
export const hyperliquidService = new HyperliquidService();