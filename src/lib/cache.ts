// Cache implementation using localStorage as fallback
// In production, this would use Redis

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheManager {
  private prefix = 'amazon_fba_';
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.getKey(key));
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      
      if (this.isExpired(item)) {
        this.delete(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn('Cache delete failed:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  // Cache with async function
  async getOrSet<T>(
    key: string, 
    fetchFunction: () => Promise<T>, 
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }

  // Cache invalidation patterns
  invalidatePattern(pattern: string): void {
    try {
      const keys = Object.keys(localStorage);
      const regex = new RegExp(pattern);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix) && regex.test(key)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache pattern invalidation failed:', error);
    }
  }
}

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard_stats',
  PRODUCTS_LIST: 'products_list',
  SUPPLIERS_LIST: 'suppliers_list',
  SHIPMENTS_LIST: 'shipments_list',
  REPORTS_DATA: 'reports_data',
  USER_PROFILE: 'user_profile',
  SUBSCRIPTION_INFO: 'subscription_info',
} as const;

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  DASHBOARD_STATS: 5 * 60 * 1000, // 5 minutes
  PRODUCTS_LIST: 2 * 60 * 1000,   // 2 minutes
  SUPPLIERS_LIST: 10 * 60 * 1000, // 10 minutes
  SHIPMENTS_LIST: 2 * 60 * 1000,  // 2 minutes
  REPORTS_DATA: 15 * 60 * 1000,   // 15 minutes
  USER_PROFILE: 30 * 60 * 1000,   // 30 minutes
  SUBSCRIPTION_INFO: 60 * 60 * 1000, // 1 hour
} as const;

// Create singleton instance
export const cache = new CacheManager();

// Cache hooks for React components
export const useCache = () => {
  const getCachedData = <T>(key: string): T | null => {
    return cache.get<T>(key);
  };

  const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
    cache.set(key, data, ttl);
  };

  const invalidateCache = (pattern: string): void => {
    cache.invalidatePattern(pattern);
  };

  const clearAllCache = (): void => {
    cache.clear();
  };

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    clearAllCache,
  };
};

// Cache middleware for Supabase queries
export const withCache = <T>(
  key: string,
  queryFunction: () => Promise<T>,
  ttl: number = CACHE_TTL.PRODUCTS_LIST
): Promise<T> => {
  return cache.getOrSet(key, queryFunction, ttl);
};
