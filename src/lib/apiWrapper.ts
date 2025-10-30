/**
 * Unified API wrapper for consistent error handling
 */

import { logger } from './logger';

export interface ApiCallResult<T> {
  data: T;
  error: null;
}

export interface ApiCallError {
  data: null;
  error: Error;
}

export type ApiCall<T> = Promise<ApiCallResult<T> | ApiCallError>;

/**
 * Wraps a promise with consistent error handling
 */
export const apiCall = async <T>(
  promise: Promise<T>
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    logger.error('API Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    
    throw new Error(errorMessage);
  }
};

/**
 * Wraps a Supabase query with standard error handling
 */
export const wrapSupabaseQuery = async <T>(
  query: Promise<{ data: T | null; error: Error | null }>
): Promise<T> => {
  try {
    const { data, error } = await query;
    
    if (error) {
      logger.error('Supabase Error:', error);
      throw new Error(error.message || 'Database error occurred');
    }
    
    if (!data) {
      logger.warn('Supabase query returned null data');
      throw new Error('No data returned from query');
    }
    
    return data;
  } catch (error) {
    logger.error('wrapSupabaseQuery Error:', error);
    throw error;
  }
};

/**
 * Wraps multiple promises with error handling
 */
export const wrapAll = async <T>(
  promises: Promise<T>[]
): Promise<T[]> => {
  try {
    return await Promise.all(promises);
  } catch (error) {
    logger.error('Promise.all Error:', error);
    throw error;
  }
};

export default apiCall;

