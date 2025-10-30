import React, { useState } from 'react';
import DateRangePicker, { DateRange } from './DateRangePicker';

export interface FilterPreset {
  id: string;
  name: string;
  filters: AdvancedFilters;
  icon?: string;
}

export interface AdvancedFilters {
  dateRange?: DateRange;
  searchTerm?: string;
  supplier?: string;
  costRange?: { min: number; max: number };
  profitRange?: { min: number; max: number };
  roiRange?: { min: number; max: number };
  status?: string;
  hasProfit?: boolean;
  [key: string]: unknown;
}

interface AdvancedFiltersPanelProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  onSavePreset?: (preset: Omit<FilterPreset, 'id'>) => void;
  savedPresets?: FilterPreset[];
  onLoadPreset?: (preset: FilterPreset) => void;
  onDeletePreset?: (presetId: string) => void;
  type?: 'products' | 'shipments' | 'reports';
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  filters,
  onChange,
  onSavePreset,
  savedPresets = [],
  onLoadPreset,
  onDeletePreset,
  type = 'products'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  const updateFilter = (key: string, value: unknown) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).length > 0;
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset({
        name: presetName.trim(),
        filters: { ...filters },
        icon: '⭐'
      });
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <span className="text-lg mr-2">🔍</span>
            Gelişmiş Filtreler
            <span className="ml-2 text-gray-400">{isExpanded ? '▼' : '▶'}</span>
          </button>
          {hasActiveFilters() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              {Object.keys(filters).length} aktif filtre
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
          
          {onSavePreset && hasActiveFilters() && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              💾 Kaydet
            </button>
          )}
        </div>
      </div>

      {/* Saved Presets */}
      {savedPresets.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {savedPresets.map((preset) => (
            <div
              key={preset.id}
              className="group relative inline-flex items-center px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm transition-colors"
            >
              <button
                onClick={() => onLoadPreset?.(preset)}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium"
              >
                <span>{preset.icon || '⭐'}</span>
                <span>{preset.name}</span>
              </button>
              <button
                onClick={() => onDeletePreset?.(preset.id)}
                className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                title="Sil"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih Aralığı
            </label>
            <DateRangePicker
              value={filters.dateRange || { startDate: '', endDate: '' }}
              onChange={(range) => updateFilter('dateRange', range)}
            />
          </div>

          {/* Search Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arama
            </label>
            <input
              type="text"
              value={filters.searchTerm || ''}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              placeholder="Ürün adı, ASIN, SKU..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Product-specific filters */}
          {type === 'products' && (
            <>
              {/* Cost Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Maliyet ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.costRange?.min || ''}
                    onChange={(e) => updateFilter('costRange', {
                      ...filters.costRange,
                      min: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. Maliyet ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.costRange?.max || ''}
                    onChange={(e) => updateFilter('costRange', {
                      ...filters.costRange,
                      max: parseFloat(e.target.value) || 1000
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Profit Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Kar ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.profitRange?.min || ''}
                    onChange={(e) => updateFilter('profitRange', {
                      ...filters.profitRange,
                      min: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. Kar ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={filters.profitRange?.max || ''}
                    onChange={(e) => updateFilter('profitRange', {
                      ...filters.profitRange,
                      max: parseFloat(e.target.value) || 1000
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ROI Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. ROI (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={filters.roiRange?.min || ''}
                    onChange={(e) => updateFilter('roiRange', {
                      ...filters.roiRange,
                      min: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. ROI (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={filters.roiRange?.max || ''}
                    onChange={(e) => updateFilter('roiRange', {
                      ...filters.roiRange,
                      max: parseFloat(e.target.value) || 100
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Has Profit Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasProfit"
                  checked={filters.hasProfit || false}
                  onChange={(e) => updateFilter('hasProfit', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasProfit" className="ml-2 text-sm text-gray-700">
                  Sadece karlı ürünleri göster
                </label>
              </div>
            </>
          )}

          {/* Shipment-specific filters */}
          {type === 'shipments' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    value={filters.status || 'all'}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="draft">Taslak</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kargo Firması
                  </label>
                  <select
                    value={filters.carrier || 'all'}
                    onChange={(e) => updateFilter('carrier', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="DHL">DHL</option>
                    <option value="USPS">USPS</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Save Preset Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Filtreyi Kaydet</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Filtre adı (örn: Karlı Ürünler)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFiltersPanel;

