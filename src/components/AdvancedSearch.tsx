import React, { useState, useEffect, useRef } from 'react';
import { SearchFilters, generateSearchSuggestions } from '../lib/smartSearch';
import { getSearchHistory, addToSearchHistory, SearchHistoryItem } from '../lib/searchHistory';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  searchType: 'product' | 'shipment';
  placeholder?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  searchType,
  placeholder = "Akıllı arama...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    manufacturer: 'all',
    carrier: 'all',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    },
    priceRange: {
      min: 0,
      max: 1000
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Arama geçmişini yükle
  useEffect(() => {
    const history = getSearchHistory().filter(item => item.type === searchType);
    setSearchHistory(history);
  }, [searchType]);

  // Önerileri güncelle
  useEffect(() => {
    if (searchTerm.length >= 2) {
      // Mock data'dan öneriler oluştur (gerçek uygulamada API'den gelecek)
      const mockItems = searchType === 'product' 
        ? [
            { name: 'Wireless Bluetooth Headphones', asin: 'B07KG5CBQ6', merchant_sku: '2L-3RP4-NL31' },
            { name: 'Smart Fitness Tracker', asin: 'B08XYZ1234', merchant_sku: 'FT-2024-001' },
            { name: 'USB-C Charging Cable', asin: 'B09ABC5678', merchant_sku: 'USB-C-3FT' }
          ]
        : [
            { fba_shipment_id: 'FBA123456789', carrier_company: 'UPS', notes: 'Priority shipping' },
            { fba_shipment_id: 'FBA987654321', carrier_company: 'FedEx', notes: 'Standard shipping' }
          ];

      const searchFields = searchType === 'product' 
        ? ['name', 'asin', 'merchant_sku'] as const
        : ['fba_shipment_id', 'carrier_company', 'notes'] as const;

      const newSuggestions = generateSearchSuggestions(mockItems, searchTerm, searchFields);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, searchType]);

  // Dışarı tıklama kontrolü
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string = searchTerm) => {
    const newFilters = { ...filters, searchTerm: term };
    setFilters(newFilters);
    onSearch(newFilters);
    
    if (term.trim()) {
      addToSearchHistory(term, searchType, newFilters);
      setSearchHistory(getSearchHistory().filter(item => item.type === searchType));
    }
    
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilters({
      searchTerm: '',
      manufacturer: 'all',
      carrier: 'all',
      status: 'all',
      dateRange: { start: '', end: '' },
      priceRange: { min: 0, max: 1000 }
    });
    onClear();
    setShowSuggestions(false);
    setShowHistory(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  const handleHistoryClick = (historyItem: SearchHistoryItem) => {
    setSearchTerm(historyItem.query);
    setFilters({ ...filters, ...historyItem.filters, searchTerm: historyItem.query });
    onSearch({ ...filters, ...historyItem.filters, searchTerm: historyItem.query });
    setShowHistory(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowHistory(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      {/* Ana Arama Input'u */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (searchHistory.length > 0) setShowHistory(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          placeholder={placeholder}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {searchTerm && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 mr-2"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => handleSearch()}
            className="p-1 text-gray-400 hover:text-primary mr-2"
          >
            🔍
          </button>
        </div>
      </div>

      {/* Arama Geçmişi */}
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Son Aramalar</span>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="py-1">
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
              >
                <span className="truncate">{item.query}</span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Arama Önerileri */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Öneriler</span>
          </div>
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gelişmiş Filtreler */}
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Üretici Filtresi (Sadece ürünler için) */}
          {searchType === 'product' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Üretici
              </label>
              <select
                value={filters.manufacturer || 'all'}
                onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tüm Üreticiler</option>
                <option value="BROSS">BROSS</option>
                <option value="CablePro">CablePro</option>
                <option value="FitTech">FitTech</option>
                <option value="PowerMax">PowerMax</option>
                <option value="SoundWave">SoundWave</option>
              </select>
            </div>
          )}

          {/* Kargo Firması Filtresi (Sadece sevkiyatlar için) */}
          {searchType === 'shipment' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kargo Firması
              </label>
              <select
                value={filters.carrier || 'all'}
                onChange={(e) => setFilters({ ...filters, carrier: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tüm Kargo Firmaları</option>
                <option value="UPS">UPS</option>
                <option value="FedEx">FedEx</option>
                <option value="DHL">DHL</option>
                <option value="Amazon Logistics">Amazon Logistics</option>
              </select>
            </div>
          )}

          {/* Durum Filtresi (Sadece sevkiyatlar için) */}
          {searchType === 'shipment' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                value={filters.status || 'all'}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="completed">Tamamlandı</option>
                <option value="draft">Taslak</option>
              </select>
            </div>
          )}

          {/* Fiyat Aralığı (Sadece ürünler için) */}
          {searchType === 'product' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fiyat Aralığı ($)
              </label>
              <div className="flex space-x-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: {
                      ...filters.priceRange!,
                      min: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    priceRange: {
                      ...filters.priceRange!,
                      max: parseFloat(e.target.value) || 1000
                    }
                  })}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Tarih Aralığı */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tarih Aralığı
            </label>
            <div className="flex space-x-1">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange!,
                    start: e.target.value
                  }
                })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  dateRange: {
                    ...filters.dateRange!,
                    end: e.target.value
                  }
                })}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Filtre Butonları */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-gray-500">
            {Object.values(filters).filter(value => 
              value !== undefined && value !== '' && value !== 'all' && 
              !(typeof value === 'object' && Object.values(value).every(v => !v))
            ).length} filtre aktif
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
            >
              Temizle
            </button>
            <button
              onClick={() => handleSearch()}
              className="text-xs px-3 py-1 bg-primary text-white hover:bg-blue-700 rounded"
            >
              Ara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
