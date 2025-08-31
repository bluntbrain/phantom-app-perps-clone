/**
 * Utility functions for formatting numbers, currencies, and percentages
 */

export const formatCurrency = (
  value: number,
  _currency: string = 'USD',
  decimals: number = 2
): string => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(decimals)}`;
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatLeverage = (value: number): string => {
  return `${value}x`;
};

export const formatPrice = (value: number, decimals: number = 4): string => {
  return `$${value.toFixed(decimals)}`;
};

export const formatVolume = (value: string): string => {
  // Handle pre-formatted volume strings like "$2B", "$670M"
  return value;
};
