/**
 * Error handling utility for consistent error message extraction
 */

/**
 * Extracts error message from unknown error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error occurred';
};

/**
 * Logs error with consistent formatting
 */
export const logError = (error: unknown, context?: string): void => {
  const message = getErrorMessage(error);
  const fullMessage = context ? `${context}: ${message}` : message;
  console.error(fullMessage);
};

/**
 * Wraps error and returns a standard Error object
 */
export const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  return new Error(getErrorMessage(error));
};

