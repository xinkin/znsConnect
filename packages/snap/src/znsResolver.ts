/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * @param name - The ZNS name to resolve (e.g., "xinkin")
 * @param chainId - The blockchain chain ID (e.g., 137 for Polygon)
 * @returns The resolved address or null if resolution fails
 */
export async function resolveZNSName(
  name: string,
  chainId: number,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://zns.bio/api/resolveDomain?domain=${name}&chain=${chainId}`,
    );
    const data = await response.json();
    return data.address || null;
  } catch (error) {
    throw new Error(`Error resolving ZNS name: ${error}`);
  }
}

/**
 * @param address - The blockchain address to reverse resolve
 * @param chainId - The blockchain chain ID (e.g., 137 for Polygon)
 * @returns The primary ZNS name or null if resolution fails
 */
export async function reverseResolveAddress(
  address: string,
  chainId: number,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://zns.bio/api/resolveAddress?address=${address}&chain=${chainId}`,
    );
    const data = await response.json();
    return data.primaryDomain || null;
  } catch (error) {
    throw new Error(`Error performing reverse lookup: ${error}`);
  }
}
