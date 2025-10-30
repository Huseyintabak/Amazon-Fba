import { useState, useCallback, useRef } from 'react';

export interface SearchConfig {
  debounceMs?: number;
  minLength?: number;
  maxResults?: number;
}

export interface SearchResult<T> {
  query: string;
  results: T[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}

export const useSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  config: SearchConfig = {}
) => {
  const {
    debounceMs = 300,
    minLength = 2,
    maxResults = 50
  } = config;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      setResults([]);
      setLoading(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchResults = await searchFunction(searchQuery);
      setResults(searchResults.slice(0, maxResults));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arama hatası');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchFunction, minLength, maxResults]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    clearSearch();
    setLoading(false);
  }, [clearSearch]);

  return {
    query,
    results,
    loading,
    error,
    hasSearched,
    handleSearch,
    clearSearch,
    reset
  };
};

// Hook for product search with full-text search
export const useProductSearch = () => {
  const searchProducts = useCallback(async () => {
    // This will be implemented with Supabase full-text search
    // For now, return empty array
    return [];
  }, []);

  return useSearch(searchProducts, {
    debounceMs: 300,
    minLength: 2,
    maxResults: 20
  });
};
