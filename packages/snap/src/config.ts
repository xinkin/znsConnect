import { tlds } from './networks';

export type ChainConfig = {
  chainId: number;
  name: string;
  tlds: string[];
};

// Convert TLDs array to ChainConfig array
export const SUPPORTED_CHAINS: ChainConfig[] = tlds.map((tld) => ({
  chainId: tld.chainId,
  name: tld.label,
  tlds: [tld.tld],
}));

/**
 * Converts an EIP155 chain ID string to a number
 *
 * @param eip155ChainId - The EIP155 chain ID string (e.g., "eip155:1")
 * @returns The numeric chain ID
 * @throws Error if the chain ID format is invalid
 */
export function getChainIdFromEIP155(eip155ChainId: string): number {
  const parts = eip155ChainId.split(':');
  if (parts.length !== 2 || parts[0] !== 'eip155' || !parts[1]) {
    throw new Error('Invalid EIP155 chain ID format');
  }
  const chainId = parseInt(parts[1], 10);
  if (isNaN(chainId)) {
    throw new Error('Invalid chain ID number');
  }
  return chainId;
}

/**
 * Converts a numeric chain ID to an EIP155 string
 *
 * @param chainId - The numeric chain ID
 * @returns The EIP155 chain ID string
 */
export function getEIP155FromChainId(chainId: number): string {
  return `eip155:${chainId}`;
}

/**
 * Gets the chain configuration for a given chain ID
 *
 * @param chainId - The numeric chain ID
 * @returns The chain configuration or undefined if not found
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
}

/**
 * Checks if a domain has a supported TLD
 *
 * @param domain - The domain to check
 * @returns True if the domain has a supported TLD
 */
export function isSupportedTLD(domain: string): boolean {
  const tld = domain.split('.').pop()?.toLowerCase();
  return tld
    ? SUPPORTED_CHAINS.some((chain) => chain.tlds.includes(tld))
    : false;
}

/**
 * Gets all supported chain IDs in EIP155 format
 *
 * @returns Array of EIP155 chain ID strings
 */
export function getAllChainIds(): string[] {
  return SUPPORTED_CHAINS.map((chain) => getEIP155FromChainId(chain.chainId));
}

/**
 * Gets all supported TLDs
 *
 * @returns Array of supported TLD strings
 */
export function getAllTLDs(): string[] {
  return SUPPORTED_CHAINS.flatMap((chain) => chain.tlds);
}
