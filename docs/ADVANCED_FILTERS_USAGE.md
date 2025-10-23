# 🔍 Advanced Filters & Date Range Usage Guide

## Components

### 1. DateRangePicker
Modern tarih aralığı seçici component

### 2. AdvancedFiltersPanel
Gelişmiş filtre paneli - multi-filter kombinasyonları

### 3. useFilterPresets Hook
Kaydedilmiş filtre şablonlarını yönetir (localStorage)

---

## Usage Example - Products Page

```typescript
import React, { useState, useMemo } from 'react';
import AdvancedFiltersPanel, { AdvancedFilters } from '../components/AdvancedFiltersPanel';
import { useFilterPresets } from '../hooks/useFilterPresets';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const { products } = useSupabaseStore();
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const { presets, savePreset, deletePreset, loadPreset } = useFilterPresets('products');

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Date range filter
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      filtered = filtered.filter(p => {
        const productDate = new Date(p.created_at);
        const start = new Date(filters.dateRange!.startDate);
        const end = new Date(filters.dateRange!.endDate);
        return productDate >= start && productDate <= end;
      });
    }

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.asin.toLowerCase().includes(term) ||
        p.merchant_sku.toLowerCase().includes(term)
      );
    }

    // Cost range
    if (filters.costRange) {
      filtered = filtered.filter(p => {
        const cost = p.product_cost || 0;
        const min = filters.costRange?.min || 0;
        const max = filters.costRange?.max || Infinity;
        return cost >= min && cost <= max;
      });
    }

    // Profit range
    if (filters.profitRange) {
      filtered = filtered.filter(p => {
        const profit = p.estimated_profit || 0;
        const min = filters.profitRange?.min || 0;
        const max = filters.profitRange?.max || Infinity;
        return profit >= min && profit <= max;
      });
    }

    // ROI range
    if (filters.roiRange) {
      filtered = filtered.filter(p => {
        const roi = p.roi_percentage || 0;
        const min = filters.roiRange?.min || 0;
        const max = filters.roiRange?.max || Infinity;
        return roi >= min && roi <= max;
      });
    }

    // Has profit checkbox
    if (filters.hasProfit) {
      filtered = filtered.filter(p => (p.estimated_profit || 0) > 0);
    }

    return filtered;
  }, [products, filters]);

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Filters Panel */}
      <AdvancedFiltersPanel
        filters={filters}
        onChange={setFilters}
        onSavePreset={savePreset}
        savedPresets={presets}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={deletePreset}
        type="products"
      />

      {/* Products Table */}
      <div className="card">
        <h3 className="card-title">
          Ürünler ({filteredProducts.length})
        </h3>
        {/* ... table content ... */}
      </div>
    </div>
  );
};
```

---

## Features

### ✅ Date Range Presets
- Bugün
- Dün
- Son 7 Gün
- Son 30 Gün
- Son 90 Gün
- Bu Ay
- Geçen Ay
- Bu Yıl
- Geçen Yıl
- Tüm Zamanlar
- **Özel Tarih** - Manuel tarih seçimi

### ✅ Multi-Filter Combinations
- Tarih Aralığı
- Arama Terimi
- Maliyet Aralığı (Min-Max)
- Kar Aralığı (Min-Max)
- ROI Aralığı (Min-Max %)
- Sadece Karlı Ürünler (checkbox)

### ✅ Saved Presets
- Filtreleri kaydet
- Kaydedilmiş filtreleri yükle
- Filtreleri sil
- localStorage'da saklanır

### ✅ Active Filters Display
- Aktif filtre sayısını gösterir
- "Filtreleri Temizle" butonu
- Kolay kullanım

---

## Filter Types by Page

### Products Page
- Date Range
- Search Term
- Cost Range
- Profit Range
- ROI Range
- Has Profit checkbox

### Shipments Page
- Date Range
- Search Term
- Status (completed/draft)
- Carrier Company
- Cost Range

### Reports Page
- Date Range
- Status
- Carrier
- Custom filters

---

## Advanced Usage

### Custom Filter Logic

```typescript
// Add custom filter
const filteredProducts = useMemo(() => {
  let filtered = [...products];

  // Custom filter: Only products with supplier
  if (filters.hasSupplier) {
    filtered = filtered.filter(p => p.supplier_id);
  }

  // Custom filter: Specific supplier
  if (filters.supplierId) {
    filtered = filtered.filter(p => p.supplier_id === filters.supplierId);
  }

  return filtered;
}, [products, filters]);
```

### Preset Icons

```typescript
onSavePreset={{
  name: 'Karlı Ürünler',
  filters: currentFilters,
  icon: '💰' // Custom icon
}}
```

---

## Styling

All components use Tailwind CSS and match the application's design system:
- ✅ Responsive design
- ✅ Hover effects
- ✅ Focus states
- ✅ Smooth transitions
- ✅ Modern UI

---

## Storage

Presets are stored in localStorage:
- `fba_filter_presets_products`
- `fba_filter_presets_shipments`
- `fba_filter_presets_reports`

Future: Sync with Supabase for multi-device access.

