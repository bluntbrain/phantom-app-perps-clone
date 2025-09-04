import { useState, useEffect } from 'react';
import { hyperUnitService, FeeEstimate } from '../services/HyperUnitService';

export function useFeeEstimation(solPrice: number) {
  const [feeEstimates, setFeeEstimates] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeEstimates = async () => {
      try {
        setLoading(true);
        const fees = await hyperUnitService.getFeeEstimates();
        setFeeEstimates(fees);
      } catch (error) {
        console.error('Failed to fetch fee estimates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeEstimates();
    // Only fetch once on mount - fees don't change frequently
  }, []);

  const getFeeInfo = () => {
    return hyperUnitService.getFormattedDepositFee(
      feeEstimates,
      'sol',
      solPrice
    );
  };

  const getTotalWithFees = (amount: string) => {
    const amountNum = parseFloat(amount) || 0;
    const feeInfo = getFeeInfo();
    if (!feeInfo) return amountNum.toFixed(6);
    const feeAmount = parseFloat(feeInfo.fee.replace(' SOL', '')) || 0;
    const total = amountNum + feeAmount;
    return total.toFixed(6);
  };

  return {
    feeEstimates,
    loadingFees: loading,
    getFeeInfo,
    getTotalWithFees,
  };
}