/**
 * Environment-aware logger utility
 * Only logs in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  
  error: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
};

export default logger;

