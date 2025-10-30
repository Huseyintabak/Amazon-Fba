import { describe, it, expect, vi } from 'vitest';
import { getErrorMessage, logError, toError } from '../errorHandler';

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should extract message from string', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Object error' };
      expect(getErrorMessage(error)).toBe('Object error');
    });

    it('should return default message for unknown error type', () => {
      expect(getErrorMessage({ code: 123 })).toBe('Unknown error occurred');
    });

    it('should return default message for null', () => {
      expect(getErrorMessage(null)).toBe('Unknown error occurred');
    });
  });

  describe('toError', () => {
    it('should return Error object as-is', () => {
      const error = new Error('Test');
      expect(toError(error)).toBe(error);
    });

    it('should wrap string in Error object', () => {
      const error = toError('String error');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('String error');
    });

    it('should wrap object with message in Error', () => {
      const error = toError({ message: 'Object error' });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Object error');
    });

    it('should handle unknown error types', () => {
      const error = toError({ code: 123 });
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Unknown error occurred');
    });
  });

  describe('logError', () => {
    it('should log error without context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logError(new Error('Test error'));
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');
      consoleErrorSpy.mockRestore();
    });

    it('should log error with context', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      logError(new Error('Test error'), 'Test Context');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Test Context: Test error');
      consoleErrorSpy.mockRestore();
    });
  });
});

