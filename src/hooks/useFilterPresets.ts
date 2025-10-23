import { useState, useEffect } from 'react';
import { FilterPreset } from '../components/AdvancedFiltersPanel';

const STORAGE_KEY = 'fba_filter_presets';

export const useFilterPresets = (type: 'products' | 'shipments' | 'reports') => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${type}`);
    if (stored) {
      try {
        setPresets(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading filter presets:', error);
      }
    }
  }, [type]);

  // Save to localStorage whenever presets change
  useEffect(() => {
    if (presets.length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${type}`, JSON.stringify(presets));
    }
  }, [presets, type]);

  const savePreset = (preset: Omit<FilterPreset, 'id'>) => {
    const newPreset: FilterPreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    setPresets(prev => [...prev, newPreset]);
  };

  const deletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    
    // Update localStorage
    const remaining = presets.filter(p => p.id !== presetId);
    if (remaining.length === 0) {
      localStorage.removeItem(`${STORAGE_KEY}_${type}`);
    }
  };

  const loadPreset = (presetId: string): FilterPreset | undefined => {
    return presets.find(p => p.id === presetId);
  };

  return {
    presets,
    savePreset,
    deletePreset,
    loadPreset
  };
};

