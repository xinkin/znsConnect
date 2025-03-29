import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

import { onNameLookup } from '.';
import { resolveZNSName, reverseResolveAddress } from './znsResolver';

// Mock the znsResolver functions
jest.mock('./znsResolver', () => ({
  resolveZNSName: jest.fn(),
  reverseResolveAddress: jest.fn(),
}));

describe('onNameLookup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('forward resolution', () => {
    it('should resolve a valid domain to an address', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      (resolveZNSName as jest.Mock).mockResolvedValue(mockAddress);

      const result = await onNameLookup({
        chainId: 'eip155:137',
        domain: 'example.poly',
      });

      expect(result).toStrictEqual({
        resolvedAddresses: [
          {
            resolvedAddress: mockAddress,
            protocol: 'ZNS',
            domainName: 'example.poly',
          },
        ],
      });
      expect(resolveZNSName).toHaveBeenCalledWith('example', 137);
    });

    it('should handle special character TLDs', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      (resolveZNSName as jest.Mock).mockResolvedValue(mockAddress);

      const result = await onNameLookup({
        chainId: 'eip155:167000',
        domain: 'example.%f0%9f%a5%81', // Taiko drum emoji TLD
      });

      expect(result).toStrictEqual({
        resolvedAddresses: [
          {
            resolvedAddress: mockAddress,
            protocol: 'ZNS',
            domainName: 'example.%f0%9f%a5%81',
          },
        ],
      });
      expect(resolveZNSName).toHaveBeenCalledWith('example', 167000);
    });

    it('should return null for unsupported TLD', async () => {
      const result = await onNameLookup({
        chainId: 'eip155:137',
        domain: 'example.unsupported',
      });

      expect(result).toBeNull();
      expect(resolveZNSName).not.toHaveBeenCalled();
    });

    it('should return null for invalid chain ID', async () => {
      const result = await onNameLookup({
        chainId: 'eip155:999999',
        domain: 'example.poly',
      });

      expect(result).toBeNull();
      expect(resolveZNSName).not.toHaveBeenCalled();
    });
  });

  describe('reverse resolution', () => {
    it('should resolve an address to a domain', async () => {
      const mockDomain = 'example.poly';
      const mockAddress = '0x1234567890123456789012345678901234567890';
      (reverseResolveAddress as jest.Mock).mockResolvedValue(mockDomain);

      const result = await onNameLookup({
        chainId: 'eip155:137',
        address: mockAddress,
      });

      expect(result).toStrictEqual({
        resolvedAddresses: [
          {
            resolvedAddress: mockAddress,
            protocol: 'ZNS',
            domainName: mockDomain,
          },
        ],
      });
      expect(reverseResolveAddress).toHaveBeenCalledWith(mockAddress, 137);
    });

    it('should return null for invalid chain ID', async () => {
      const result = await onNameLookup({
        chainId: 'eip155:999999',
        address: '0x1234567890123456789012345678901234567890',
      });

      expect(result).toBeNull();
      expect(reverseResolveAddress).not.toHaveBeenCalled();
    });
  });
});

describe('ZNS Resolver Snap', () => {
  let snap: any;

  beforeEach(async () => {
    snap = await installSnap();
  });

  describe('forward resolution', () => {
    it('should resolve a valid domain to an address', async () => {
      const response = await snap.request({
        method: 'onNameLookup',
        params: {
          chainId: 'eip155:137',
          domain: 'example.poly',
        },
      });

      expect(response).toBeDefined();
      expect(response.resolvedAddresses).toHaveLength(1);
      expect(response.resolvedAddresses[0].protocol).toBe('ZNS');
    });

    it('should handle special character TLDs', async () => {
      const response = await snap.request({
        method: 'onNameLookup',
        params: {
          chainId: 'eip155:167000',
          domain: 'example.%f0%9f%a5%81', // Taiko drum emoji TLD
        },
      });

      expect(response).toBeDefined();
      expect(response.resolvedAddresses).toHaveLength(1);
      expect(response.resolvedAddresses[0].protocol).toBe('ZNS');
    });

    it('should return null for unsupported TLD', async () => {
      const response = await snap.request({
        method: 'onNameLookup',
        params: {
          chainId: 'eip155:137',
          domain: 'example.unsupported',
        },
      });

      expect(response).toBeNull();
    });

    it('should return null for invalid chain ID', async () => {
      const response = await snap.request({
        method: 'onNameLookup',
        params: {
          chainId: 'eip155:999999',
          domain: 'example.poly',
        },
      });

      expect(response).toBeNull();
    });
  });

  describe('reverse resolution', () => {
    it('should resolve an address to a domain', async () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      const response = await snap.request({
        method: 'onNameLookup',
        params: {
          chainId: 'eip155:137',
          address: mockAddress,
        },
      });

      expect(response).toBeDefined();
      expect(response.resolvedAddresses).toHaveLength(1);
      expect(response.resolvedAddresses[0].protocol).toBe('ZNS');
      expect(response.resolvedAddresses[0].resolvedAddress).toBe(mockAddress);
    });

    it('should return null for invalid chain ID', async () => {
      const response = await snap.request({
        method: 'onNameLookup',
        params: {
          chainId: 'eip155:999999',
          address: '0x1234567890123456789012345678901234567890',
        },
      });

      expect(response).toBeNull();
    });
  });
});
