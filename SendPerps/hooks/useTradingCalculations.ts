import { useMemo } from 'react';

export function useTradingCalculations(size: string, leverage: string, availableBalance: number) {
  const sizeNum = useMemo(() => parseFloat(size) || 0, [size]);
  const leverageNum = useMemo(() => parseFloat(leverage) || 1, [leverage]);

  const formatSize = () => {
    return sizeNum > 0 ? `$${sizeNum.toFixed(2)}` : '$0';
  };

  const calculateLeveragedSize = () => {
    const leveragedSize = sizeNum * leverageNum;
    return leveragedSize > 0 ? `$${leveragedSize.toFixed(2)}` : '$0';
  };

  const isInsufficientFunds = sizeNum > availableBalance;
  const isAmountZero = sizeNum === 0;
  const isBelowMinimum = (sizeNum * leverageNum) < 10; 

  const getButtonText = () => {
    if (isAmountZero) return 'Enter Amount';
    if (isBelowMinimum) return 'Minimum $10 Order';
    if (isInsufficientFunds) return 'Insufficient Funds';
    return 'Review';
  };

  const isButtonDisabled = isAmountZero || isInsufficientFunds || isBelowMinimum;

  return {
    sizeNum,
    leverageNum,
    formatSize,
    calculateLeveragedSize,
    isInsufficientFunds,
    isAmountZero,
    isBelowMinimum,
    getButtonText,
    isButtonDisabled,
  };
}