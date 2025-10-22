// Akıllı arama ve filtreleme utility fonksiyonları

import { Product, Shipment } from '../types';

export interface SearchFilters {
  searchTerm: string;
  manufacturer?: string;
  carrier?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  appliedFilters: SearchFilters;
}

// Akıllı arama fonksiyonu - ASIN, SKU, ürün adı karışık arama
export const smartSearch = <T extends Product | Shipment>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return items;

  const query = searchTerm.toLowerCase().trim();
  
  return items.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(query);
      }
      return false;
    });
  });
};

// Ürünler için akıllı arama
export const searchProducts = (
  products: Product[],
  filters: SearchFilters
): SearchResult<Product> => {
  let filteredProducts = [...products];

  // Ana arama terimi
  if (filters.searchTerm) {
    filteredProducts = smartSearch(filteredProducts, filters.searchTerm, [
      'name',
      'asin',
      'merchant_sku',
      'manufacturer',
      'manufacturer_code',
      'amazon_barcode'
    ]);
  }

  // Üretici filtresi
  if (filters.manufacturer && filters.manufacturer !== 'all') {
    filteredProducts = filteredProducts.filter(
      product => product.manufacturer === filters.manufacturer
    );
  }

  // Fiyat aralığı filtresi
  if (filters.priceRange) {
    filteredProducts = filteredProducts.filter(product => {
      const cost = product.product_cost || 0;
      return cost >= filters.priceRange!.min && cost <= filters.priceRange!.max;
    });
  }

  return {
    items: filteredProducts,
    totalCount: filteredProducts.length,
    appliedFilters: filters
  };
};

// Sevkiyatlar için akıllı arama
export const searchShipments = (
  shipments: Shipment[],
  filters: SearchFilters
): SearchResult<Shipment> => {
  let filteredShipments = [...shipments];

  // Ana arama terimi
  if (filters.searchTerm) {
    filteredShipments = smartSearch(filteredShipments, filters.searchTerm, [
      'fba_shipment_id',
      'carrier_company',
      'notes'
    ]);
  }

  // Kargo firması filtresi
  if (filters.carrier && filters.carrier !== 'all') {
    filteredShipments = filteredShipments.filter(
      shipment => shipment.carrier_company === filters.carrier
    );
  }

  // Durum filtresi
  if (filters.status && filters.status !== 'all') {
    filteredShipments = filteredShipments.filter(
      shipment => shipment.status === filters.status
    );
  }

  // Tarih aralığı filtresi
  if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    filteredShipments = filteredShipments.filter(shipment => {
      const shipmentDate = new Date(shipment.shipment_date);
      return shipmentDate >= startDate && shipmentDate <= endDate;
    });
  }

  return {
    items: filteredShipments,
    totalCount: filteredShipments.length,
    appliedFilters: filters
  };
};

// Arama önerileri oluşturma
export const generateSearchSuggestions = (
  items: (Product | Shipment)[],
  searchTerm: string,
  searchFields: (keyof (Product | Shipment))[]
): string[] => {
  if (!searchTerm.trim() || searchTerm.length < 2) return [];

  const query = searchTerm.toLowerCase();
  const suggestions = new Set<string>();

  items.forEach(item => {
    searchFields.forEach(field => {
      const value = item[field];
      if (typeof value === 'string' && value.toLowerCase().includes(query)) {
        suggestions.add(value);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5);
};

// Arama sonuçlarını sıralama
export const sortSearchResults = <T>(
  items: T[],
  sortBy: keyof T,
  sortOrder: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Arama istatistikleri
export const getSearchStats = (results: SearchResult<any>) => {
  return {
    totalItems: results.totalCount,
    hasResults: results.totalCount > 0,
    appliedFiltersCount: Object.values(results.appliedFilters).filter(
      value => value !== undefined && value !== '' && value !== 'all'
    ).length
  };
};
