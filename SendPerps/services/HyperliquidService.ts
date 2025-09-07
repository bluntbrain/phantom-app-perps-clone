import 'event-target-polyfill';
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
import { hyperliquidSDKService, type WalletProvider } from './HyperliquidSDKService';

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
    this.baseUrl = 'https://api.hyperliquid.xyz';
    this.websocketUrl = 'wss://api.hyperliquid.xyz/ws';
  }

  public async setupSDK(walletProvider: WalletProvider) {
    await hyperliquidSDKService.setProvider(walletProvider);
  }




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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('api request failed:', error);
      throw error;
    }
  }

  // fetch perpetuals metadata and universe
  public async getMeta(): Promise<MetaResponse> {
    return await this.apiCall({ type: 'meta' });
  }

  // get meta and contexts
  private async getMetaAndAssetCtxs(): Promise<[MetaResponse, AssetContext[]]> {
    return await this.apiCall({ type: 'metaAndAssetCtxs' });
  }

  private async getSpotMetaAndAssetCtxs(): Promise<any> {
    const requestBody = { type: 'spotMetaAndAssetCtxs' };
    const result = await this.apiCall(requestBody);
    return result;
  }

  public async getPerpsData(): Promise<PerpsData[]> {
    try {
      const [meta, assetCtxs] = await this.getMetaAndAssetCtxs();
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

  // fetch perp account balance for user
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

  // fetch spot wallet balances including usol and usdc
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

      ws.onclose = () => {
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

      ws.onclose = () => {
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
    this.priceConnections.forEach((ws) => {
      ws.close();
    });
    this.priceConnections.clear();

    this.candleConnections.forEach((ws) => {
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

  // transfer usdc between spot and perp accounts (mainnet only supports usdc)
  public async transferBetweenAccounts(amount: string, toPerp: boolean, userAddress?: string): Promise<any> {
    try {
      if (!userAddress) {
        throw new Error('User address is required for transfer');
      }
      
      const spotBalances = await this.getSpotBalance(userAddress);
      const requestedAmount = parseFloat(amount);
      const usdcBalance = spotBalances.find(balance => balance.coin === 'USDC');
      
      if (!usdcBalance || parseFloat(usdcBalance.total) < requestedAmount) {
        const errorMsg = `Insufficient USDC balance for transfer. Current USDC: ${usdcBalance?.total || '0'}, Required: ${amount}`;
        throw new Error(errorMsg);
      }
      
      const result = await hyperliquidSDKService.usdClassTransfer({
        amount: amount,
        toPerp: toPerp
      });
      
      console.log('[Transfer] Completed transfer:', { amount, toPerp, userAddress }, result);
      return result;
    } catch (error) {
      console.error('[Transfer] Failed:', { amount, toPerp, userAddress }, error);
      throw error;
    }
  }

  // find spot asset by symbol (e.g., "SOL/USDC") or auto-detect USOL pair
  // (Currently unused - logic inlined in placeSpotOrder)
  /*
  private async getSpotAssetIndex(symbol: string): Promise<number> {
    try {
      const [spotMeta] = await this.getSpotMetaAndAssetCtxs();
      
      console.log('SPOT ASSET DEBUG');
      console.log('Requested symbol:', symbol);
      console.log('Available tokens:', spotMeta.tokens.map((token: any) => ({
        name: token.name,
        index: token.index
      })));
      console.log('Available spot pairs:', spotMeta.universe.map((asset: any) => ({
        name: asset.name,
        tokens: asset.tokens,
        index: asset.index
      })));
      
      // First try exact match
      let assetIndex = spotMeta.universe.findIndex((asset: any) => {
        return asset.name === symbol;
      });
      
      console.log('Exact match result for', symbol, ':', assetIndex);
      
      // If not found and looking for any SOL-related pair, try multiple strategies
      if (assetIndex === -1 && (symbol === 'SOL/USDC' || symbol === 'USOL/USDC')) {
        console.log('Trying to find SOL/USDC equivalent...');
        
        // Strategy 1: Look for USOL/USDC by name
        assetIndex = spotMeta.universe.findIndex((asset: any) => {
          return asset.name === 'USOL/USDC';
        });
        console.log('USOL/USDC name match:', assetIndex);
        
        // Strategy 2: Look for any pair containing USOL and USDC tokens
        if (assetIndex === -1) {
          const usdcToken = spotMeta.tokens.find((token: any) => token.name === 'USDC');
          const usolToken = spotMeta.tokens.find((token: any) => token.name === 'USOL');
          
          console.log('Found USDC token:', usdcToken);
          console.log('Found USOL token:', usolToken);
          
          if (usdcToken && usolToken) {
            assetIndex = spotMeta.universe.findIndex((asset: any) => {
              // Check if this pair contains both USOL and USDC tokens
              return asset.tokens.includes(usolToken.index) && asset.tokens.includes(usdcToken.index);
            });
            console.log('Token-based match result:', assetIndex);
            
            if (assetIndex !== -1) {
              console.log('Found USOL/USDC pair:', spotMeta.universe[assetIndex]);
            }
          }
        }
        
        // Strategy 3: Look for any SOL-related pair
        if (assetIndex === -1) {
          assetIndex = spotMeta.universe.findIndex((asset: any) => {
            return asset.name.includes('SOL') && asset.name.includes('USDC');
          });
          console.log('SOL-USDC string match result:', assetIndex);
        }
      }
      
      if (assetIndex === -1) {
        // List available pairs for debugging
        const availablePairs = spotMeta.universe.map((asset: any) => asset.name).join(', ');
        console.log('ASSET NOT FOUND');
        console.log('Available pairs:', availablePairs);
        throw new Error(`Spot asset ${symbol} not found. Available pairs: ${availablePairs}`);
      }
      
      console.log('Final asset index:', assetIndex);
      console.log('Final asset details:', spotMeta.universe[assetIndex]);
      console.log('END DEBUG');
      
      // For spot assets, use 10000 + index
      return 10000 + assetIndex;
    } catch (error) {
      console.error('Failed to get spot asset index:', error);
      throw error;
    }
  }
  */

  // get current spot price for a trading pair
  public async getSpotPrice(symbol: string): Promise<number> {
    try {
      const [, assetCtxs] = await this.getSpotMetaAndAssetCtxs();
      const [spotMeta] = await this.getSpotMetaAndAssetCtxs();
      
      const assetIndex = spotMeta.universe.findIndex((asset: any) => {
        return asset.name === symbol || `${asset.tokens[0]}/${asset.tokens[1]}` === symbol;
      });
      
      if (assetIndex === -1) {
        throw new Error(`Spot asset ${symbol} not found`);
      }
      
      const assetCtx = assetCtxs[assetIndex];
      if (!assetCtx) {
        throw new Error(`Price data for ${symbol} not available`);
      }
      
      return parseFloat(assetCtx.markPx || assetCtx.midPx || '0');
    } catch (error) {
      console.error('Failed to get spot price:', symbol, error);
      throw error;
    }
  }

  // place spot order for token swaps (e.g., usol to usdc)
  public async placeSpotOrder(orderParams: {
    symbol: string; // e.g., "USOL/USDC"
    isBuy: boolean; // false for selling USOL to get USDC
    usdValue?: string; // USD value to swap (e.g., "10") - optional
    solAmount?: string; // Direct SOL/USOL amount (e.g., "0.1") - optional
    slippageTolerance?: number; // default 0.5%
    userAddress?: string; // optional user address for signing
  }): Promise<any> {
    try {
      // Use SDK to find asset and get proper decimals
      const { assetIndex, spotAssetIndex, priceDecimals, sizeDecimals, currentPrice } = await hyperliquidSDKService.findSpotAssetWithTickSize(orderParams.symbol);
      
      // Determine size and format with proper decimals
      let rawSize: number;
      if (orderParams.solAmount) {
        rawSize = parseFloat(orderParams.solAmount);
      } else if (orderParams.usdValue) {
        const usdValue = parseFloat(orderParams.usdValue);
        rawSize = usdValue / currentPrice;
      } else {
        throw new Error('Either solAmount or usdValue must be provided');
      }
      
      const size = hyperliquidSDKService.formatSizeWithDecimals(rawSize, sizeDecimals);
      
      // Set price with slippage
      const slippage = orderParams.slippageTolerance || 0.5;
      let rawPrice: number;
      
      if (orderParams.isBuy) {
        rawPrice = currentPrice * (1 + slippage / 100);
      } else {
        rawPrice = currentPrice * (1 - slippage / 100);
      }
      
      // Use SDK to format price with proper decimals
      const price = hyperliquidSDKService.formatPriceWithDecimals(rawPrice, priceDecimals);
      
      const orderData = {
        a: spotAssetIndex,
        b: orderParams.isBuy,
        p: price,
        s: size,
        r: false,
        t: { limit: { tif: "Ioc" as "Ioc" } }
      };
      
      const result = await hyperliquidSDKService.order({
        orders: [orderData],
        grouping: "na"
      });
      
      console.log('[Spot Order] Completed:', orderParams, { assetIndex, spotAssetIndex, currentPrice, size, price, priceDecimals, sizeDecimals }, result);
      return result;
    } catch (error) {
      console.error('[Spot Order] Failed:', orderParams, error);
      throw error;
    }
  }

  // place an order
  public async placeOrder(orderParams: {
    coin: string;
    isBuy: boolean;
    size: string;
    price?: string;
    orderType: 'limit' | 'market';
    reduceOnly?: boolean;
    postOnly?: boolean;
  }): Promise<any> {
    try {
      // Find asset index for the coin
      const meta = await this.getMeta();
      const assetIndex = meta.universe.findIndex(asset => asset.name === orderParams.coin);
      
      if (assetIndex === -1) {
        throw new Error(`Asset ${orderParams.coin} not found`);
      }

      const orderData = {
        a: assetIndex, // asset index
        b: orderParams.isBuy, // is buy
        p: orderParams.price || "0", // price (0 for market orders)
        s: orderParams.size, // size
        r: orderParams.reduceOnly || false, // reduce only
        t: {
          limit: {
            tif: (orderParams.orderType === 'market' ? "Ioc" : 
                 orderParams.postOnly ? "Alo" : "Gtc") as "Ioc" | "Gtc" | "Alo"
          }
        }
      };

      const result = await hyperliquidSDKService.order({
        orders: [orderData],
        grouping: "na" as const
      });
      
      console.log('[Order] Completed:', orderParams, { assetIndex, orderData }, result);
      return result;
    } catch (error) {
      console.error('[Order] Failed:', orderParams, error);
      throw error;
    }
  }

  // cancel order using sdk
  public async cancelOrder(asset: number, orderId: number): Promise<any> {
    try {
      const result = await hyperliquidSDKService.cancelOrder({
        asset,
        orderId
      });
      
      console.log('cancel order completed:', { asset, orderId }, result);
      return result;
    } catch (error) {
      console.error('cancel order failed:', { asset, orderId }, error);
      throw error;
    }
  }

  // modify order using sdk - requires full order parameters
  public async modifyOrder(params: {
    orderId: number;
    asset: number;
    isBuy: boolean;
    price: string;
    size: string;
    reduceOnly?: boolean;
    orderType: 'limit' | 'market';
    postOnly?: boolean;
  }): Promise<any> {
    try {
      const result = await hyperliquidSDKService.modifyOrder(params);
      
      console.log('modify order completed:', params, result);
      return result;
    } catch (error) {
      console.error('modify order failed:', params, error);
      throw error;
    }
  }

  // update leverage using sdk
  public async updateLeverage(asset: number, isCross: boolean, leverage: number): Promise<any> {
    try {
      const result = await hyperliquidSDKService.updateLeverage({
        asset,
        isCross,
        leverage
      });
      
      console.log('update leverage completed:', { asset, isCross, leverage }, result);
      return result;
    } catch (error) {
      console.error('update leverage failed:', { asset, isCross, leverage }, error);
      throw error;
    }
  }

  // get exact current price for a specific asset using hyperliquid sdk
  public async getCurrentPrice(coinSymbol: string): Promise<{
    price: number;
    markPrice: number;
    midPrice: number;
    change24h: number;
    changePercent24h: number;
  }> {
    try {
      const meta = await this.getMeta();
      const [, assetCtxs] = await this.getMetaAndAssetCtxs();
      
      const coin = coinSymbol.replace('-USD', '');
      const assetIndex = meta.universe.findIndex(asset => asset.name === coin);
      
      if (assetIndex === -1) {
        throw new Error(`Asset ${coin} not found in Hyperliquid universe`);
      }
      
      if (!assetCtxs[assetIndex]) {
        throw new Error(`No price context available for ${coin}`);
      }
      
      const ctx = assetCtxs[assetIndex];
      const markPrice = parseFloat(ctx.markPx || '0');
      const midPrice = parseFloat(ctx.midPx || '0');
      const prevDayPrice = parseFloat(ctx.prevDayPx || '0');
      
      if (markPrice === 0 && midPrice === 0) {
        throw new Error(`No valid price data available for ${coin}`);
      }
      
      const currentPrice = markPrice || midPrice;
      const change24h = currentPrice - prevDayPrice;
      const changePercent24h = prevDayPrice > 0 ? (change24h / prevDayPrice) * 100 : 0;
      
      console.log(`[getCurrentPrice] ${coin}: $${currentPrice.toLocaleString()} (${changePercent24h >= 0 ? '+' : ''}${changePercent24h.toFixed(2)}%)`);
      
      return {
        price: currentPrice,
        markPrice,
        midPrice,
        change24h,
        changePercent24h
      };
    } catch (error) {
      console.error(`get current price failed for ${coinSymbol}:`, error);
      throw error;
    }
  }

  // retrieve user's perpetuals account summary
  public async getUserPerpAccountSummary(userAddress: string, dex?: string): Promise<any> {
    try {
      const requestBody = {
        type: 'clearinghouseState',
        user: userAddress,
        ...(dex && { dex })
      };

      const result = await this.apiCall(requestBody);
      console.log('get user perp account summary completed:', { userAddress, dex }, result);
      return result;
    } catch (error) {
      console.error('get user perp account summary failed:', { userAddress, dex }, error);
      throw error;
    }
  }

  // retrieve user's open orders with frontend info
  public async getUserOpenOrders(userAddress: string, dex?: string): Promise<any> {
    try {
      const requestBody = {
        type: 'frontendOpenOrders',
        user: userAddress,
        ...(dex && { dex })
      };

      const result = await this.apiCall(requestBody);
      console.log('get user open orders completed:', { userAddress, dex }, result);
      return result;
    } catch (error) {
      console.error('get user open orders failed:', { userAddress, dex }, error);
      throw error;
    }
  }


}

// singleton - using MAINNET only
export const hyperliquidService = new HyperliquidService();