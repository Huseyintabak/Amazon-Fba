import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have all logger methods', () => {
    expect(logger.log).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
  });

  it('should have logger.log as function', () => {
    expect(typeof logger.log).toBe('function');
  });

  it('should have logger.error as function', () => {
    expect(typeof logger.error).toBe('function');
  });
});
