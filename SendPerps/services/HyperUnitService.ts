import { apiLogger } from '../utils/apiLogger';
import { isValidSolanaAddress, isValidEthereumAddress, isValidTransactionHash } from '../utils/validation';
import { formatNumber, formatCurrency } from '../utils/formatting';
import { 
  BridgeAddress, 
  OperationStatus, 
  FeeEstimate,
} from '../types/hyperunit';

export { BridgeAddress, OperationStatus, FeeEstimate };

export class HyperUnitService {
  private baseUrl: string;
  private feeCache: { data: FeeEstimate | null; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // cache for 5 minutes
  
  constructor() {
    this.baseUrl = 'https://api.hyperunit.xyz';
    console.log('HyperUnitService initialized:', this.baseUrl);
  }

  /**
   * Fetch API 
   */
  private async fetchWithLogging(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const startTime = Date.now();
    
    // Log the request
    const logId = apiLogger.logRequest(
      'HyperUnit',
      method,
      url,
      options.headers as Record<string, string>,
      options.body ? JSON.parse(options.body as string) : undefined
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const duration = Date.now() - startTime;
      
      // Clone response to read body without consuming the original
      const responseClone = response.clone();
      let responseData: any = null;
      
      if (response.ok) {
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await responseClone.json();
          } else {
            responseData = await responseClone.text();
          }
        } catch (error) {
          // If we can't read the clone, just log without body data
          responseData = '[Response body could not be read]';
        }
      } else {
        responseData = `Error: ${response.status} ${response.statusText}`;
      }

      // Log the response
      apiLogger.logResponse(logId, 'HyperUnit', response.status, responseData, duration);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      apiLogger.logError('HyperUnit', method, url, error, duration);
      throw error;
    }
  }

  /**
   * Get fee estimates from the API
   */
  public async getFeeEstimates(): Promise<FeeEstimate> {
    // Check cache first
    if (this.feeCache && 
        this.feeCache.data && 
        (Date.now() - this.feeCache.timestamp < this.CACHE_DURATION)) {
      console.log('Using cached fee estimates');
      return this.feeCache.data;
    }

    console.log('Fetching fee estimates');
    
    try {
      const response = await this.fetchWithLogging('/estimate-fees');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch fee estimates: ${errorText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.feeCache = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (error) {
      console.error('Fee fetch failed:', error);
      // Return cached data if available, even if expired
      if (this.feeCache?.data) {
        console.log('Using expired cache due to error');
        return this.feeCache.data;
      }
      throw error;
    }
  }

  /**
   * Generate a deposit address for bridging
   */
  public async generateDepositAddress(
    sourceChain: 'solana' | 'ethereum' | 'arbitrum',
    asset: 'btc' | 'eth' | 'sol' | 'fart' | 'pump',
    destinationAddress: string
  ): Promise<BridgeAddress> {
    // Validate destination address
    if (!isValidEthereumAddress(destinationAddress) && !isValidSolanaAddress(destinationAddress)) {
      throw new Error('Invalid destination address format');
    }

    const endpoint = `/gen/${sourceChain}/hyperliquid/${asset}/${destinationAddress}`;
    
    try {
      const response = await this.fetchWithLogging(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate deposit address: ${errorText}`);
      }

      const data = await response.json();
      console.log('Deposit address generated');
      return data;
    } catch (error) {
      console.error('Deposit address generation failed:', error);
      throw error;
    }
  }

  /**
   * Get operation status by ID
   */
  public async getOperationStatus(operationId: string): Promise<OperationStatus> {
    const endpoint = `/operation/${operationId}`;
    
    try {
      const response = await this.fetchWithLogging(endpoint);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Operation not found');
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch operation status: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Operation fetch failed ${operationId}:`, error);
      throw error;
    }
  }

  /**
   * Get all operations for a user address
   */
  public async getUserOperations(userAddress: string): Promise<any[]> {
    const endpoint = `/operations/${userAddress}`;
    
    try {
      const response = await this.fetchWithLogging(endpoint);

      if (!response.ok) {
        console.log('User operations fetch failed');
        return [];
      }

      const data = await response.json();
      console.log(`Found ${data.length} operations`);
      return data;
    } catch (error) {
      console.error('User operations fetch failed:', error);
      return [];
    }
  }

  /**
   * Poll operation status until completed or failed
   */
  public async pollOperationStatus(
    operationId: string,
    onStatusUpdate?: (status: OperationStatus) => void,
    maxAttempts = 60,
    intervalMs = 5000
  ): Promise<OperationStatus> {
    console.log(`Polling operation ${operationId}`);
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const status = await this.getOperationStatus(operationId);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }

        if (status.status === 'completed' || status.status === 'failed') {
          console.log(`Operation ${operationId} completed:`, status.status);
          return status;
        }

        console.log(`Operation ${operationId}:`, { status: status.status, attempt: `${attempt + 1}/${maxAttempts}` });
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error(`Operation poll error ${operationId}:`, error);
        
        // Continue polling even if there's an error
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error(`Operation ${operationId} did not complete within timeout`);
  }

  /**
   * Get minimum deposit amount for an asset
   */
  public getMinimumDeposit(asset: 'btc' | 'eth' | 'sol' | 'fart' | 'pump'): string {
    const minimums = {
      'btc': '0.002 BTC',
      'eth': '0.05 ETH',
      'sol': '0.2 SOL',
      'fart': '20 FART',
      'pump': '10000 PUMP'
    };
    return minimums[asset] || '0';
  }

  /**
   * Format fee for display
   */
  public formatFee(fee: number, asset: 'btc' | 'eth' | 'sol' | 'fart' | 'pump'): string {
    const symbols = {
      'btc': 'BTC',
      'eth': 'ETH',
      'sol': 'SOL',
      'fart': 'FART',
      'pump': 'PUMP'
    };
    return `${formatNumber(fee, 6)} ${symbols[asset]}`;
  }

  /**
   * Get formatted deposit fee with USD value
   */
  public getFormattedDepositFee(
    feeEstimates: FeeEstimate | null,
    asset: 'sol',
    solPrice?: number
  ): { fee: string; usd: string; eta: string } | null {
    if (!feeEstimates?.solana) return null;

    const feeLamports = feeEstimates.solana['solana-depositFee'];
    const eta = feeEstimates.solana['solana-depositEta'];
    
    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const fee = feeLamports / 1_000_000_000;
    const usdValue = solPrice ? fee * solPrice : 0;

    return {
      fee: this.formatFee(fee, asset),
      usd: formatCurrency(usdValue),
      eta
    };
  }

  /**
   * Validate Solana transaction hash
   */
  public isValidSolanaTxHash(hash: string): boolean {
    return isValidTransactionHash(hash, 'solana');
  }

  /**
   * Get explorer URL for a transaction
   */
  public getSolanaExplorerUrl(txHash: string): string {
    return `https://solscan.io/tx/${txHash}`;
  }
}

// Export singleton instance 
export const hyperUnitService = new HyperUnitService();