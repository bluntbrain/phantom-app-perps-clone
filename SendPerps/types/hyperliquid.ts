// Hyperliquid Trading API Types

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

export interface HyperliquidSpotBalance {
  coin: string;
  token: number;
  hold: string;
  total: string;
  entryNtl: string;
}

export interface MetaResponse {
  universe: Array<{
    name: string;
    szDecimals: number;
    maxLeverage: number;
    onlyIsolated?: boolean;
    isDelisted?: boolean;
  }>;
  marginTables: Array<[number, any]>;
}

export interface AssetContext {
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

export interface OrderRequest {
  coin: string;
  isBuy: boolean;
  sz: number;
  limitPx?: number;
  orderType: 'limit' | 'market';
  reduceOnly?: boolean;
  ioc?: boolean;
  postOnly?: boolean;
  cloid?: string;
}

export interface OrderResponse {
  status: 'ok' | 'error';
  response?: {
    type: string;
    data?: any;
    msg?: string;
  };
}

export interface WebSocketMessage {
  channel: string;
  data: any;
}

export interface PriceUpdate {
  coin: string;
  markPx: string;
  oraclePx: string;
  openInterest: string;
  funding: string;
}