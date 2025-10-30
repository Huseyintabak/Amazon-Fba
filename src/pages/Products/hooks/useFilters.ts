import { useState, useCallback } from 'react';
import { AdvancedFilters } from '../../../components/AdvancedFiltersPanel';

export const useFilters = () => {
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [sortField, setSortField] = useState<keyof any>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleFilterChange = useCallback((newFilters: Partial<AdvancedFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSearchInput = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const handleSort = useCallback((field: keyof any) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSortField('created_at');
    setSortDirection('desc');
  }, []);

  const getSortIcon = useCallback((field: keyof any) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  }, [sortField, sortDirection]);

  return {
    filters,
    sortField,
    sortDirection,
    handleFilterChange,
    handleSearchInput,
    handleSort,
    clearFilters,
    getSortIcon
  };
};

