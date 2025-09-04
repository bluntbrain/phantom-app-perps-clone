// Formatting utilities for numbers, addresses, and other display values

export const formatAddress = (address: string, chars = 6): string => {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatNumber = (
  value: number | string,
  decimals = 2,
  compact = false
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';
  
  if (compact && num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (compact && num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toFixed(decimals);
};

export const formatCurrency = (
  value: number | string,
  currency = 'USD',
  decimals = 2
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '$0.00';
  
  if (currency === 'USD') {
    return `$${formatNumber(num, decimals, num >= 10000)}`;
  }
  
  return `${formatNumber(num, decimals)} ${currency}`;
};

export const formatPercentage = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0%';
  
  const formatted = num >= 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
  return formatted;
};

export const formatTokenAmount = (
  amount: string | number,
  decimals: number = 18
): string => {
  const value = typeof amount === 'string' ? amount : amount.toString();
  const divisor = Math.pow(10, decimals);
  const result = parseFloat(value) / divisor;
  return formatNumber(result, 4);
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1e9) {
    return `$${(volume / 1e9).toFixed(1)}B`;
  } else if (volume >= 1e6) {
    return `$${(volume / 1e6).toFixed(0)}M`;
  } else if (volume >= 1e3) {
    return `$${(volume / 1e3).toFixed(0)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
};