import { describe, it, expect, vi } from 'vitest';
import { apiCall, wrapSupabaseQuery } from '../apiWrapper';
import { logger } from '../logger';

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }
}));

describe('apiWrapper', () => {
  describe('apiCall', () => {
    it('should return a promise', async () => {
      const fn = Promise.resolve('success');
      const result = apiCall(fn);
      
      expect(result).toBeInstanceOf(Promise);
      expect(await result).toBe('success');
    });

    it('should resolve with data', async () => {
      const fn = Promise.resolve('test data');
      const result = await apiCall(fn);
      
      expect(result).toBe('test data');
    });

    it('should handle errors gracefully', async () => {
      const fn = Promise.reject(new Error('Test error'));
      
      await expect(apiCall(fn)).rejects.toThrow('Test error');
    });
  });

  describe('wrapSupabaseQuery', () => {
    it('should return data when successful', async () => {
      const query = Promise.resolve({ data: 'test data', error: null });
      const result = await wrapSupabaseQuery(query);
      
      expect(result).toBe('test data');
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      const query = Promise.resolve({ data: null, error });
      
      await expect(wrapSupabaseQuery(query)).rejects.toThrow();
    });

    it('should throw error when data is null', async () => {
      const query = Promise.resolve({ data: null, error: null });
      
      await expect(wrapSupabaseQuery(query)).rejects.toThrow();
    });
  });
});

