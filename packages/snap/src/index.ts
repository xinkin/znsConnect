import type {
  OnNameLookupHandler,
  OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

import { getChainIdFromEIP155, getChainConfig, isSupportedTLD } from './config';
import { resolveZNSName, reverseResolveAddress } from './znsResolver';

export const onNameLookup: OnNameLookupHandler = async (request) => {
  const { chainId, domain, address } = request;

  // Handle forward resolution (domain to address)
  if (domain && isSupportedTLD(domain)) {
    const chainIdNumber = getChainIdFromEIP155(chainId);
    const chainConfig = getChainConfig(chainIdNumber);

    if (!chainConfig) {
      return null;
    }

    // Remove the TLD if present
    const cleanDomain = domain.replace(
      new RegExp(`\\.(${chainConfig.tlds.join('|')})$`, 'u'),
      '',
    );
    const resolvedAddress = await resolveZNSName(cleanDomain, chainIdNumber);

    if (resolvedAddress) {
      return {
        resolvedAddresses: [
          {
            resolvedAddress,
            protocol: 'ZNS',
            domainName: domain,
          },
        ],
      };
    }
  }

  // Handle reverse resolution (address to domain)
  if (address) {
    const chainIdNumber = getChainIdFromEIP155(chainId);
    const chainConfig = getChainConfig(chainIdNumber);

    if (!chainConfig) {
      return null;
    }

    const resolvedDomain = await reverseResolveAddress(address, chainIdNumber);

    if (resolvedDomain) {
      return {
        resolvedAddresses: [
          {
            resolvedAddress: address,
            protocol: 'ZNS',
            domainName: resolvedDomain,
          },
        ],
      };
    }
  }

  return null;
};

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  if (request.method === 'onNameLookup') {
    const params = request.params as Parameters<OnNameLookupHandler>[0];
    return onNameLookup(params);
  }
  throw new Error('Method not found.');
};
