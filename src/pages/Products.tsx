import React, { useState, useMemo, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import { useSubscription } from '../hooks/useSubscription';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useFilterPresets } from '../hooks/useFilterPresets';
import { Product } from '../types';
import { processCSVFile, getCSVTemplate } from '../lib/csvImport';
import AdvancedFiltersPanel, { AdvancedFilters, FilterPreset } from '../components/AdvancedFiltersPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import UsageBanner from '../components/UsageBanner';
import UpgradeModal from '../components/UpgradeModal';
import BulkOperations from '../components/BulkOperations';
import { validateProduct } from '../lib/validation';
import { supabase } from '../lib/supabase';

const Products: React.FC = () => {
  const { showToast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, loadProducts } = useSupabaseStore();
  const { canCreateProduct, hasFeature } = useSubscription();
  const bulkSelection = useBulkSelection<Product>();
  const { presets, savePreset, deletePreset } = useFilterPresets('products');
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLimitType, setUpgradeLimitType] = useState<'products' | 'shipments' | 'general'>('products');
  const [importResults, setImportResults] = useState<{
    success: boolean;
    products: any[];
    errors: string[];
    duplicates: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Sorting state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Load products on component mount
  React.useEffect(() => {
    loadProducts();
  }, []); // Empty dependency array to run only once

  // Apply advanced filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Date range filter
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      filtered = filtered.filter(p => {
        const productDate = new Date(p.created_at);
        const start = new Date(filters.dateRange!.startDate);
        const end = new Date(filters.dateRange!.endDate);
        end.setHours(23, 59, 59, 999); // Include end date
        return productDate >= start && productDate <= end;
      });
    }

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.asin.toLowerCase().includes(term) ||
        p.merchant_sku.toLowerCase().includes(term) ||
        p.supplier_name?.toLowerCase().includes(term) ||
        p.manufacturer_code?.toLowerCase().includes(term)
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
        const min = filters.profitRange?.min || -Infinity;
        const max = filters.profitRange?.max || Infinity;
        return profit >= min && profit <= max;
      });
    }

    // ROI range
    if (filters.roiRange) {
      filtered = filtered.filter(p => {
        const roi = p.roi_percentage || 0;
        const min = filters.roiRange?.min || -Infinity;
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
  
  // Sorting logic
  const sortedProducts = useMemo(() => {
    if (!sortField) return filteredProducts;
    
    return [...filteredProducts].sort((a, b) => {
      let aValue = a[sortField as keyof typeof a];
      let bValue = b[sortField as keyof typeof b];
      
      // Handle different data types
      if (sortField === 'product_cost') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortField === 'created_at') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortDirection]);
  
  // Pagination calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
  
  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return ''; // No icon when not sorted
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleDelete = async (productId: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      deleteProduct(productId);
      setShowDeleteModal(null);
      showToast('Ürün başarıyla silindi!', 'success');
    } catch (error) {
      showToast('Ürün silinirken hata oluştu!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleAdd = () => {
    // Check if user can create more products
    if (!canCreateProduct()) {
      setUpgradeLimitType('products');
      setShowUpgradeModal(true);
      return;
    }
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleImport = () => {
    // CSV import is Pro feature
    if (!hasFeature('csvExport')) {
      setUpgradeLimitType('general');
      setShowUpgradeModal(true);
      return;
    }
    setShowImportModal(true);
    setImportResults(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      showToast('Lütfen CSV dosyası seçin', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const results = await processCSVFile(file, products);
      setImportResults(results);

      if (results.success) {
        showToast(`${results.products.length} ürün başarıyla işlendi`, 'success');
      } else {
        showToast('CSV dosyası işlenirken hata oluştu', 'error');
      }
    } catch (error) {
      showToast('Dosya işlenirken hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (importResults?.success && importResults.products.length > 0) {
      try {
        setIsLoading(true);
        let successCount = 0;
        let errorCount = 0;
        
        // Add each product to Supabase
        for (const product of importResults.products) {
          try {
            await addProduct(product);
            successCount++;
          } catch (error) {
            console.error('Error adding product:', error);
            errorCount++;
          }
        }
        
        if (successCount > 0) {
          showToast(`${successCount} ürün başarıyla eklendi!${errorCount > 0 ? ` ${errorCount} ürün atlandı (zaten mevcut).` : ''}`, 'success');
        } else {
          showToast('Hiçbir ürün eklenemedi!', 'error');
        }
        
        setShowImportModal(false);
        setImportResults(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        showToast('Ürünler eklenirken hata oluştu!', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'urun-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV şablonu indirildi', 'success');
  };

  // Bulk Operations Handlers
  const handleBulkEdit = async (updates: Partial<Product>) => {
    try {
      setIsLoading(true);
      let successCount = 0;
      
      for (const productId of bulkSelection.selectedItems) {
        try {
          await updateProduct(productId, updates);
          successCount++;
        } catch (error) {
          console.error(`Error updating product ${productId}:`, error);
        }
      }
      
      showToast(`${successCount} ürün başarıyla güncellendi!`, 'success');
    } catch (error) {
      showToast('Ürünler güncellenirken hata oluştu!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      let successCount = 0;
      
      for (const productId of bulkSelection.selectedItems) {
        try {
          await deleteProduct(productId);
          successCount++;
        } catch (error) {
          console.error(`Error deleting product ${productId}:`, error);
        }
      }
      
      showToast(`${successCount} ürün başarıyla silindi!`, 'success');
    } catch (error) {
      showToast('Ürünler silinirken hata oluştu!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-full">
        <LoadingSpinner fullScreen text="Ürünler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Usage Banner */}
      <UsageBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürün Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ürünlerinizi görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Yeni Ürün Ekle</span>
          </button>
          <button
            onClick={handleImport}
            className="btn-success flex items-center space-x-2"
          >
            <span>📥</span>
            <span>CSV İçe Aktar</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
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
          <div className="card-header">
            <h3 className="card-title">
              Ürünler ({filteredProducts.length})
            </h3>
            <p className="card-subtitle">
              Toplam {products.length} ürün
              {Object.keys(filters).length > 0 && ` • ${filteredProducts.length} filtrelenmiş sonuç`}
              {totalPages > 1 && ` • Sayfa ${currentPage}/${totalPages}`}
            </p>
          </div>

        <div className="mobile-table">
          <table className="table min-w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell w-12">
                  <input
                    type="checkbox"
                    checked={bulkSelection.isAllSelected(paginatedProducts)}
                    onChange={() => bulkSelection.toggleAll(paginatedProducts)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    title="Tümünü seç/kaldır"
                  />
                </th>
                <th className="table-header-cell w-64">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Ürün Adı</span>
                    <span className="text-sm">{getSortIcon('name')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-32">
                  <button
                    onClick={() => handleSort('asin')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>ASIN</span>
                    <span className="text-sm">{getSortIcon('asin')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-32">
                  <button
                    onClick={() => handleSort('merchant_sku')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Merchant SKU</span>
                    <span className="text-sm">{getSortIcon('merchant_sku')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-32">
                  <button
                    onClick={() => handleSort('supplier_name')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Tedarikçi</span>
                    <span className="text-sm">{getSortIcon('supplier_name')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-24">
                  <button
                    onClick={() => handleSort('manufacturer_code')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Üretici Kodu</span>
                    <span className="text-sm">{getSortIcon('manufacturer_code')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-28">
                  <button
                    onClick={() => handleSort('product_cost')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Ürün Maliyeti</span>
                    <span className="text-sm">{getSortIcon('product_cost')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-32">
                  <button
                    onClick={() => handleSort('estimated_profit')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Tahmini Kar</span>
                    <span className="text-sm">{getSortIcon('estimated_profit')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-24">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Oluşturulma</span>
                    <span className="text-sm">{getSortIcon('created_at')}</span>
                  </button>
                </th>
                <th className="table-header-cell w-24">İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {paginatedProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className={`table-row ${bulkSelection.isSelected(product.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="table-cell w-12">
                    <input
                      type="checkbox"
                      checked={bulkSelection.isSelected(product.id)}
                      onChange={() => bulkSelection.toggleSelection(product.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="table-cell w-64">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl text-gray-400">📦</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">
                          {product.name}
                        </div>
                        {product.amazon_barcode && (
                          <div className="text-sm text-gray-500 truncate">
                            Barkod: {product.amazon_barcode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell w-32">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono block truncate">
                      {product.asin}
                    </code>
                  </td>
                  <td className="table-cell w-32">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono block truncate">
                      {product.merchant_sku}
                    </code>
                  </td>
                  <td className="table-cell w-32">
                    {product.supplier_name ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 truncate">
                          {product.supplier_name}
                        </span>
                        {product.supplier_country && (
                          <span className="text-xs text-gray-500">
                            {product.supplier_country}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell w-24">
                    {product.manufacturer_code ? (
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono block truncate">
                        {product.manufacturer_code}
                      </code>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell w-28">
                    {product.product_cost ? (
                      <span className="font-semibold text-green-600">
                        ${product.product_cost.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell w-32">
                    {product.estimated_profit !== undefined && product.estimated_profit !== null ? (
                      <div className="flex flex-col">
                        <span className={`font-bold ${product.estimated_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${product.estimated_profit.toFixed(2)}
                        </span>
                        {product.profit_margin !== undefined && (
                          <span className={`text-xs ${
                            product.profit_margin >= 20 ? 'text-green-600' : 
                            product.profit_margin >= 10 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {product.profit_margin.toFixed(1)}% margin
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Hesaplanmadı</span>
                    )}
                  </td>
                  <td className="table-cell w-24">
                    <div className="text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="table-cell w-24">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="action-btn action-btn-edit"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(product)}
                        className="action-btn action-btn-delete"
                        title="Sil"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => window.location.href = `/products/${product.id}`}
                        className="action-btn action-btn-view"
                        title="Detayları Görüntüle"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedProducts.length === 0 && (
          <div className="text-center py-12">
            <span className="mx-auto text-6xl text-gray-400">📦</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Ürün bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun ürün bulunmamaktadır.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sonraki
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{startIndex + 1}</span>
                  {' - '}
                  <span className="font-medium">{Math.min(endIndex, filteredProducts.length)}</span>
                  {' / '}
                  <span className="font-medium">{filteredProducts.length}</span>
                  {' sonuçtan'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Önceki</span>
                    ←
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Sonraki</span>
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={(product) => {
            if (editingProduct) {
              updateProduct(product.id, product);
              showToast('Ürün başarıyla güncellendi!', 'success');
            } else {
              addProduct(product);
              showToast('Ürün başarıyla eklendi!', 'success');
            }
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          product={showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          onConfirm={() => handleDelete(showDeleteModal.id)}
        />
      )}

      {/* CSV Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportResults(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        onFileSelect={handleFileSelect}
        onConfirm={handleConfirmImport}
        onDownloadTemplate={handleDownloadTemplate}
        results={importResults}
        fileInputRef={fileInputRef}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType={upgradeLimitType}
        feature={upgradeLimitType === 'general' ? 'CSV İçe/Dışa Aktarma' : undefined}
      />

      {/* Bulk Operations */}
      <BulkOperations
        selectedCount={bulkSelection.selectedCount}
        selectedItems={bulkSelection.selectedItems}
        allItems={products}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        onClearSelection={bulkSelection.clearSelection}
      />
    </div>
  );
};

// Product Modal Component
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    asin: product?.asin || '',
    merchant_sku: product?.merchant_sku || '',
    manufacturer_code: product?.manufacturer_code || '',
    amazon_barcode: product?.amazon_barcode || '',
    product_cost: product?.product_cost || 0,
    // Profit Calculator fields
    amazon_price: product?.amazon_price || 0,
    referral_fee_percent: product?.referral_fee_percent || 15,
    fulfillment_fee: product?.fulfillment_fee || 0,
    advertising_cost: product?.advertising_cost || 0,
    // Supplier
    supplier_id: product?.supplier_id || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProfitCalculator, setShowProfitCalculator] = useState(false);

  // Load suppliers on mount
  React.useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name, company_name, country')
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }
    };
    loadSuppliers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate using validation utility
    const validation = validateProduct(formData);
    
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach(error => {
        newErrors[error.field] = error.message;
      });
      setErrors(newErrors);
      return;
    }

    const productData: Product = {
      ...formData,
      id: product?.id || '',
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(productData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ❌
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Ürün Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Ürün adını girin"
            />
            {errors.name && <p className="error-message">{errors.name}</p>}
          </div>

          <div>
            <label className="label">ASIN *</label>
            <input
              type="text"
              value={formData.asin}
              onChange={(e) => setFormData({ ...formData, asin: e.target.value })}
              className={`input-field ${errors.asin ? 'input-error' : ''}`}
              placeholder="Amazon ASIN numarası"
            />
            {errors.asin && <p className="error-message">{errors.asin}</p>}
          </div>

          <div>
            <label className="label">Merchant SKU *</label>
            <input
              type="text"
              value={formData.merchant_sku}
              onChange={(e) => setFormData({ ...formData, merchant_sku: e.target.value })}
              className={`input-field ${errors.merchant_sku ? 'input-error' : ''}`}
              placeholder="Merchant SKU"
            />
            {errors.merchant_sku && <p className="error-message">{errors.merchant_sku}</p>}
          </div>

          <div>
            <label className="label">Tedarikçi</label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className="input-field"
            >
              <option value="">Tedarikçi seçiniz</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                  {supplier.company_name ? ` (${supplier.company_name})` : ''}
                  {supplier.country ? ` - ${supplier.country}` : ''}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Henüz tedarikçi yok. <a href="/suppliers" className="text-blue-600 hover:underline">Tedarikçi ekle</a>
              </p>
            )}
          </div>

          <div>
            <label className="label">Üretici Kodu</label>
            <input
              type="text"
              value={formData.manufacturer_code}
              onChange={(e) => setFormData({ ...formData, manufacturer_code: e.target.value })}
              className="input-field"
              placeholder="Üretici kodu (opsiyonel)"
            />
          </div>

          <div>
            <label className="label">Amazon Barkod</label>
            <input
              type="text"
              value={formData.amazon_barcode}
              onChange={(e) => setFormData({ ...formData, amazon_barcode: e.target.value })}
              className="input-field"
              placeholder="Amazon barkod numarası"
            />
          </div>

          <div>
            <label className="label">Ürün Maliyeti ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.product_cost || ''}
                onChange={(e) => setFormData({ ...formData, product_cost: parseFloat(e.target.value) || 0 })}
                className="input-field pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Profit Calculator Toggle */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowProfitCalculator(!showProfitCalculator)}
              className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg border border-green-200 transition-all"
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💰</span>
                <span className="font-medium text-gray-900">Kar Hesaplama (Premium)</span>
              </div>
              <span className="text-gray-600">{showProfitCalculator ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Profit Calculator Fields */}
          {showProfitCalculator && (
            <div className="space-y-4 pt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="label">🏷️ Amazon Satış Fiyatı ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amazon_price || ''}
                  onChange={(e) => setFormData({ ...formData, amazon_price: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">🏪 Referral Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.referral_fee_percent || ''}
                  onChange={(e) => setFormData({ ...formData, referral_fee_percent: parseFloat(e.target.value) || 15 })}
                  className="input-field"
                  placeholder="15"
                />
                <p className="text-xs text-gray-500 mt-1">Genelde %15</p>
              </div>

              <div>
                <label className="label">🚚 FBA Fulfillment Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fulfillment_fee || ''}
                  onChange={(e) => setFormData({ ...formData, fulfillment_fee: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">📊 Reklam Maliyeti (PPC/Birim) ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.advertising_cost || ''}
                  onChange={(e) => setFormData({ ...formData, advertising_cost: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              {/* Profit Preview */}
              {formData.amazon_price > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-2">💰 Kar Önizleme</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Satış Fiyatı:</span>
                      <span className="font-semibold">${formData.amazon_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referral Fee:</span>
                      <span className="text-red-600">-${((formData.amazon_price * (formData.referral_fee_percent || 0)) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ürün Maliyeti:</span>
                      <span className="text-red-600">-${(formData.product_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fulfillment Fee:</span>
                      <span className="text-red-600">-${(formData.fulfillment_fee || 0).toFixed(2)}</span>
                    </div>
                    {formData.advertising_cost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reklam:</span>
                        <span className="text-red-600">-${(formData.advertising_cost || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-green-300 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Net Kar:</span>
                        <span className={`text-lg font-bold ${
                          (formData.amazon_price - (formData.product_cost || 0) - (formData.fulfillment_fee || 0) - (formData.advertising_cost || 0) - ((formData.amazon_price * (formData.referral_fee_percent || 0)) / 100)) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${(formData.amazon_price - (formData.product_cost || 0) - (formData.fulfillment_fee || 0) - (formData.advertising_cost || 0) - ((formData.amazon_price * (formData.referral_fee_percent || 0)) / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-600">Kar Marjı:</span>
                        <span className="text-sm font-semibold text-green-700">
                          {((((formData.amazon_price - (formData.product_cost || 0) - (formData.fulfillment_fee || 0) - (formData.advertising_cost || 0) - ((formData.amazon_price * (formData.referral_fee_percent || 0)) / 100)) / formData.amazon_price) * 100) || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {product ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
interface DeleteModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ product, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ürünü Sil
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ❌
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <p className="text-sm text-gray-600">ASIN: {product.asin}</p>
            <p className="text-sm text-gray-600">SKU: {product.merchant_sku}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

// CSV Import Modal
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirm: () => void;
  onDownloadTemplate: () => void;
  results: {
    success: boolean;
    products: any[];
    errors: string[];
    duplicates: string[];
  } | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  onConfirm,
  onDownloadTemplate,
  results,
  fileInputRef
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            CSV İçe Aktar
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ❌
          </button>
        </div>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-600">📋</span>
              <h4 className="font-medium text-blue-900">CSV Şablonu</h4>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Doğru format için CSV şablonunu indirin ve doldurun.
            </p>
            <button
              onClick={onDownloadTemplate}
              className="btn-secondary text-sm"
            >
              📥 Şablonu İndir
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="label">CSV Dosyası Seçin</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sadece .csv dosyaları kabul edilir
            </p>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-3">
              {/* Success Results */}
              {results.success && results.products.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-600">✅</span>
                    <h4 className="font-medium text-green-900">Başarılı</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    {results.products.length} ürün başarıyla işlendi ve eklenmeye hazır.
                  </p>
                </div>
              )}

              {/* Errors */}
              {results.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-red-600">❌</span>
                    <h4 className="font-medium text-red-900">Hatalar ({results.errors.length})</h4>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700 mb-1">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {results.duplicates.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <h4 className="font-medium text-yellow-900">Tekrarlar ({results.duplicates.length})</h4>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {results.duplicates.map((duplicate, index) => (
                      <p key={index} className="text-sm text-yellow-700 mb-1">
                        {duplicate}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              İptal
            </button>
            {results?.success && results.products.length > 0 && (
              <button
                onClick={onConfirm}
                className="btn-success"
              >
                {results.products.length} Ürünü Ekle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
