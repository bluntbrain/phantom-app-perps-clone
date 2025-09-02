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

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class HyperliquidService {
  private baseUrl: string;
  private websocketUrl: string;
  private priceConnections: Map<string, WebSocket> = new Map();
  private candleConnections: Map<string, WebSocket> = new Map();
  private candleCallbacks: Map<string, (candle: CandleData, isSnapshot?: boolean, index?: number, total?: number) => void> = new Map();

  constructor() {
    this.baseUrl = 'https://api.hyperliquid.xyz';
    this.websocketUrl = 'wss://api.hyperliquid.xyz/ws';
  }

  // init wallet
  public initializeWallet(walletAddress: string) {
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
          const formattedVolume = this.formatVolume(volume);          const item: PerpsData = {
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
        .filter((item): item is PerpsData => item !== null);      return perpsData;
    } catch (error) {
      console.error('failed to fetch perps:', error);
      throw error;
    }
  }

  // get user balance
  public async getUserBalance(userAddress: string): Promise<HyperliquidBalance> {
    try {
      const clearinghouseState = await this.apiCall({
        type: 'clearinghouseState',
        user: userAddress
      });      return {
        totalValue: clearinghouseState.marginSummary.accountValue,
        availableBalance: clearinghouseState.withdrawable,
      };
    } catch (error) {
      console.error('failed to fetch balance:', error);
      return {
        totalValue: '0',
        availableBalance: '0',
      };
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
      const intervalMs = this.getIntervalMs(interval);
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
  
  // get interval ms
  private getIntervalMs(interval: string): number {
    const intervals: { [key: string]: number } = {
      '1m': 60 * 1000,
      '3m': 3 * 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '2h': 2 * 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '8h': 8 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000
    };
    return intervals[interval] || 60 * 1000;
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

  // format volume
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

  // get icon url
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

  // get asset name
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
}// singleton
export const hyperliquidService = new HyperliquidService();