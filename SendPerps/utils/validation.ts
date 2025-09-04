// Validation utilities

export const isValidSolanaAddress = (address: string): boolean => {
  // Solana addresses are base58 encoded and typically 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
};

export const isValidEthereumAddress = (address: string): boolean => {
  // Ethereum addresses start with 0x and are 42 characters total
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethRegex.test(address);
};

export const isValidTransactionHash = (hash: string, chain: 'solana' | 'ethereum' = 'solana'): boolean => {
  if (chain === 'solana') {
    // Solana transaction signatures are base58 encoded, typically 87-88 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
    return base58Regex.test(hash);
  } else {
    // Ethereum transaction hashes are 66 characters (0x + 64 hex chars)
    const ethTxRegex = /^0x[a-fA-F0-9]{64}$/;
    return ethTxRegex.test(hash);
  }
};

export const validateAmount = (
  amount: string,
  min: number,
  max?: number
): { valid: boolean; error?: string } => {
  const value = parseFloat(amount);
  
  if (isNaN(value)) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (value < min) {
    return { valid: false, error: `Amount must be at least ${min}` };
  }
  
  if (max && value > max) {
    return { valid: false, error: `Amount must not exceed ${max}` };
  }
  
  return { valid: true };
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};