// HyperUnit Bridge API Types

export interface FeeEstimate {
  bitcoin?: {
    'bitcoin-deposit-fee-rate-sats-per-vb'?: number;
    'bitcoin-deposit-size-v-bytes'?: number;
    'bitcoin-depositEta': string;
    'bitcoin-depositFee': number;
    'bitcoin-withdrawal-fee-rate-sats-per-vb'?: number;
    'bitcoin-withdrawal-size-v-bytes'?: number;
    'bitcoin-withdrawalEta': string;
    'bitcoin-withdrawalFee': number;
  };
  ethereum?: {
    'ethereum-base-fee'?: number;
    'ethereum-depositEta': string;
    'ethereum-depositFee': number;
    'ethereum-eth-deposit-gas'?: number;
    'ethereum-eth-withdrawal-gas'?: number;
    'ethereum-priority-fee'?: number;
    'ethereum-withdrawalEta': string;
    'ethereum-withdrawalFee': number;
  };
  solana?: {
    'solana-depositEta': string;
    'solana-depositFee': number;
    'solana-withdrawalEta': string;
    'solana-withdrawalFee': number;
  };
  spl?: {
    'spl-depositEta': string;
    'spl-depositFee': number;
    'spl-withdrawalEta': string;
    'spl-withdrawalFee': number;
  };
}

export interface BridgeAddress {
  address: string;
  signatures: {
    'field-node': string;
    'hl-node': string;
    'node-1': string;
  };
  status: string;
}

export interface OperationStatus {
  id: string;
  status: string;
  positionInWithdrawQueue?: number;
  sourceTx?: string;
  destinationTx?: string;
  amount?: string;
  asset?: string;
  type?: 'deposit' | 'withdrawal';
  createdAt?: string;
}

export interface Operation {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceChain: string;
  destinationChain: string;
  asset: string;
  amount: string;
  sourceTx?: string;
  destinationTx?: string;
  timestamp: number;
  fee?: string;
}

export type SupportedAsset = 'btc' | 'eth' | 'sol' | 'fart' | 'pump';
export type SupportedChain = 'solana' | 'ethereum' | 'arbitrum' | 'hyperliquid';

export interface DepositAddressResponse {
  address: string;
  chain: string;
  asset: string;
  destination: string;
}

export interface OperationStatusResponse {
  id: string;
  status: string;
  details?: any;
}