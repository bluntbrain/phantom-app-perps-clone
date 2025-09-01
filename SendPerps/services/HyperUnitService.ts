export interface BridgeAddress {
  address: string;
  signatures: {
    'field-node': string;
    'hl-node': string;
    'node-1': string;
  };
  status: string;
}

export interface FeeEstimate {
  bitcoin?: {
    depositEta: string;
    depositFee: number;
    withdrawalEta: string;
    withdrawalFee: number;
  };
  ethereum?: {
    depositEta: string;
    depositFee: number;
    withdrawalEta: string;
    withdrawalFee: number;
  };
  solana?: {
    depositEta: string;
    depositFee: number;
    withdrawalEta: string;
    withdrawalFee: number;
  };
}

export class HyperUnitService {
  private baseUrl: string;
  private isTestnet: boolean;

  constructor(isTestnet: boolean = false) {
    this.isTestnet = isTestnet;
    this.baseUrl = isTestnet 
      ? 'https://api.hyperunit-testnet.xyz'
      : 'https://api.hyperunit.xyz';
  }

  /**
   * Generate a deposit address for bridging assets to Hyperliquid
   */
  public async generateDepositAddress(
    sourceChain: 'bitcoin' | 'solana' | 'ethereum',
    asset: 'btc' | 'eth' | 'sol',
    hyperliquidAddress: string
  ): Promise<BridgeAddress> {
    try {
      const url = `${this.baseUrl}/gen/${sourceChain}/hyperliquid/${asset}/${hyperliquidAddress}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as BridgeAddress;
    } catch (error) {
      console.error('Failed to generate deposit address:', error);
      throw error;
    }
  }

  /**
   * Generate a withdrawal address for bridging assets from Hyperliquid
   */
  public async generateWithdrawalAddress(
    destinationChain: 'bitcoin' | 'solana' | 'ethereum',
    asset: 'btc' | 'eth' | 'sol',
    destinationAddress: string
  ): Promise<BridgeAddress> {
    try {
      const url = `${this.baseUrl}/gen/hyperliquid/${destinationChain}/${asset}/${destinationAddress}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as BridgeAddress;
    } catch (error) {
      console.error('Failed to generate withdrawal address:', error);
      throw error;
    }
  }

  /**
   * Get current fee estimates for deposits and withdrawals
   */
  public async getFeeEstimates(): Promise<FeeEstimate> {
    try {
      const url = `${this.baseUrl}/v2/estimate-fees`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as FeeEstimate;
    } catch (error) {
      console.error('Failed to fetch fee estimates:', error);
      throw error;
    }
  }

  /**
   * Format fee amount for display
   */
  public formatFee(feeInWei: number, asset: 'btc' | 'eth' | 'sol'): string {
    switch (asset) {
      case 'btc':
        // Fee is in satoshis
        return `${(feeInWei / 100000000).toFixed(8)} BTC`;
      case 'eth':
        // Fee is in wei
        return `${(feeInWei / 1e18).toFixed(6)} ETH`;
      case 'sol':
        // Fee is in lamports
        return `${(feeInWei / 1e9).toFixed(6)} SOL`;
      default:
        return `${feeInWei}`;
    }
  }

  /**
   * Get minimum deposit amount for an asset
   */
  public getMinimumDeposit(asset: 'btc' | 'eth' | 'sol'): string {
    switch (asset) {
      case 'btc':
        return '0.002 BTC';
      case 'eth':
        return '0.05 ETH';
      case 'sol':
        return '0.1 SOL';
      default:
        return '0';
    }
  }

  /**
   * Get supported chains for an asset
   */
  public getSupportedChains(asset: 'btc' | 'eth' | 'sol'): string[] {
    switch (asset) {
      case 'btc':
        return ['bitcoin'];
      case 'eth':
        return ['ethereum'];
      case 'sol':
        return ['solana'];
      default:
        return [];
    }
  }
}

// Export singleton instance
export const hyperUnitService = new HyperUnitService();