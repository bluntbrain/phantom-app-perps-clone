// Cryptocurrency-specific utilities

export const CRYPTO_SYMBOLS: Record<string, string> = {
  'BTC': 'Bitcoin',
  'ETH': 'Ethereum',
  'SOL': 'Solana',
  'ARB': 'Arbitrum',
  'MATIC': 'Polygon',
  'AVAX': 'Avalanche',
  'FTM': 'Fantom',
  'BNB': 'Binance Coin',
  'ADA': 'Cardano',
  'DOT': 'Polkadot',
  'LINK': 'Chainlink',
  'UNI': 'Uniswap',
  'AAVE': 'Aave',
  'CRV': 'Curve',
  'SNX': 'Synthetix',
  'DOGE': 'Dogecoin',
  'SHIB': 'Shiba Inu',
  'PEPE': 'Pepe',
  'WIF': 'dogwifhat',
  'FART': 'Fartcoin',
  'PUMP': 'Pump.fun',
};

export const getCryptoIcon = (symbol: string): string | null => {
  // Map to CoinGecko IDs for icon URLs
  const coinGeckoIds: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ARB': 'arbitrum',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'FTM': 'fantom',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
    'AAVE': 'aave',
    'CRV': 'curve-dao-token',
    'SNX': 'havven',
    'DOGE': 'dogecoin',
    'SHIB': 'shiba-inu',
    'PEPE': 'pepe',
    'WIF': 'dogwifcoin',
  };

  const id = coinGeckoIds[symbol.toUpperCase()];
  if (!id) return null;
  
  return `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png`;
};

export const getCoinIcon = (symbol: string): string | undefined => {
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
    'LINK': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    'UNI': 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
    'ATOM': 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    'FTM': 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png',
    'NEAR': 'https://assets.coingecko.com/coins/images/10365/small/near.jpg',
    'ALGO': 'https://assets.coingecko.com/coins/images/4380/small/download.png',
    'AAVE': 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    'SAND': 'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg',
    'MANA': 'https://assets.coingecko.com/coins/images/878/small/decentraland-mana.png',
    'AXS': 'https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png',
    'ICP': 'https://assets.coingecko.com/coins/images/14495/small/Internet_Computer_logo.png',
    'APT': 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png',
    'ARB': 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    'OP': 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
  };
  
  return iconMappings[symbol] || undefined;
};

export const getAssetName = (symbol: string): string => {
  // First check CRYPTO_SYMBOLS for common names
  if (CRYPTO_SYMBOLS[symbol]) {
    return CRYPTO_SYMBOLS[symbol];
  }
  
  // Extended names list for additional assets
  const extendedNames: { [key: string]: string } = {
    'XRP': 'Ripple',
    'ATOM': 'Cosmos',
    'NEAR': 'Near Protocol',
    'ALGO': 'Algorand',
    'SAND': 'The Sandbox',
    'MANA': 'Decentraland',
    'AXS': 'Axie Infinity',
    'ICP': 'Internet Computer',
    'APT': 'Aptos',
    'OP': 'Optimism',
  };
  
  return extendedNames[symbol] || symbol;
};

export const formatLeverage = (leverage: number | string): string => {
  const value = typeof leverage === 'string' ? parseFloat(leverage) : leverage;
  return `${value}x`;
};

export const calculatePositionValue = (
  size: number | string,
  price: number | string
): number => {
  const sizeNum = typeof size === 'string' ? parseFloat(size) : size;
  const priceNum = typeof price === 'string' ? parseFloat(price) : price;
  return sizeNum * priceNum;
};

export const calculatePnL = (
  entryPrice: number | string,
  currentPrice: number | string,
  size: number | string,
  isLong: boolean
): number => {
  const entry = typeof entryPrice === 'string' ? parseFloat(entryPrice) : entryPrice;
  const current = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  const sizeNum = typeof size === 'string' ? parseFloat(size) : size;
  
  const priceDiff = isLong ? (current - entry) : (entry - current);
  return priceDiff * sizeNum;
};

export const calculatePnLPercentage = (
  entryPrice: number | string,
  currentPrice: number | string,
  isLong: boolean,
  leverage: number = 1
): number => {
  const entry = typeof entryPrice === 'string' ? parseFloat(entryPrice) : entryPrice;
  const current = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
  
  const priceDiff = isLong ? (current - entry) : (entry - current);
  const percentChange = (priceDiff / entry) * 100;
  return percentChange * leverage;
};

export const calculateLiquidationPrice = (
  entryPrice: number | string,
  leverage: number | string,
  isLong: boolean
): number => {
  const entry = typeof entryPrice === 'string' ? parseFloat(entryPrice) : entryPrice;
  const lev = typeof leverage === 'string' ? parseFloat(leverage) : leverage;
  
  // Simplified calculation (actual may vary based on exchange)
  const maintenanceMargin = 0.5; // 0.5% maintenance margin
  const initialMargin = 100 / lev;
  const liquidationDistance = initialMargin - maintenanceMargin;
  
  if (isLong) {
    return entry * (1 - liquidationDistance / 100);
  } else {
    return entry * (1 + liquidationDistance / 100);
  }
};

export const getIntervalMs = (interval: string): number => {
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
  return intervals[interval] || 60 * 1000; // default to 1m
};