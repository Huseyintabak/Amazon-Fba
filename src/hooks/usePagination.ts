import { useState, useCallback, useEffect } from 'react';

export interface PaginationConfig {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  maxVisiblePages?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (items: number) => void;
}

export const usePagination = <T>(
  initialItemsPerPage: number = 20
): PaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [data] = useState<T[]>([]);
  const [totalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  return {
    data,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
      hasNextPage,
      hasPreviousPage,
      startIndex,
      endIndex,
    },
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage: handleSetItemsPerPage,
  };
};

// Hook for loading paginated data
export const usePaginatedData = <T>(
  loadFunction: (page: number, itemsPerPage: number) => Promise<{ data: T[]; count: number }>,
  initialItemsPerPage: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const loadData = useCallback(async (page: number, itemsPerPage: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFunction(page, itemsPerPage);
      setData(result.data);
      setTotalItems(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [loadFunction]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const handleSetItemsPerPage = useCallback((items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const refreshData = useCallback(() => {
    loadData(currentPage, itemsPerPage);
  }, [loadData, currentPage, itemsPerPage]);

  // Load data when page or items per page changes
  useEffect(() => {
    loadData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]); // Remove loadData to prevent infinite loop

  return {
    data,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
      hasNextPage,
      hasPreviousPage,
      startIndex,
      endIndex,
    },
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage: handleSetItemsPerPage,
    loading,
    error,
    refreshData,
  };
};
