import { useState, useCallback } from 'react';

export interface BulkSelectionHook<T extends { id: string }> {
  selectedItems: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  toggleAll: (items: T[]) => void;
  clearSelection: () => void;
  selectAll: (items: T[]) => void;
  selectedCount: number;
  isAllSelected: (items: T[]) => boolean;
}

export function useBulkSelection<T extends { id: string }>(): BulkSelectionHook<T> {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const isSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAll = useCallback((items: T[]) => {
    const allIds = items.map(item => item.id);
    const allSelected = allIds.every(id => selectedItems.has(id));
    
    if (allSelected) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(allIds));
    }
  }, [selectedItems]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const selectAll = useCallback((items: T[]) => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, []);

  const isAllSelected = useCallback((items: T[]) => {
    if (items.length === 0) return false;
    return items.every(item => selectedItems.has(item.id));
  }, [selectedItems]);

  return {
    selectedItems,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectAll,
    selectedCount: selectedItems.size,
    isAllSelected,
  };
}

