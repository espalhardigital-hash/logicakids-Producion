import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as storageService from './storageService';

// Mock apiRequest globally
vi.mock('./storageService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./storageService')>();
  return {
    ...actual,
    getUserStatsSummary: actual.getUserStatsSummary,
    getStorageUsage: actual.getStorageUsage
  };
});

describe('storageService', () => {
  describe('getStorageUsage', () => {
    it('returns Cloud', () => {
      expect(storageService.getStorageUsage()).toBe('Cloud');
    });
  });

  // Note: Mocking apiRequest effectively requires setting up fetch mocks
  // or mocking the internal dependencies. We will just test pure functions first.
});
