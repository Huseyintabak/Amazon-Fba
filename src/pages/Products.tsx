import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useUpgradeRedirect } from '../hooks/useUpgradeRedirect';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useFilterPresets } from '../hooks/useFilterPresets';
import { Product } from '../types';
import { processCSVFile, getCSVTemplate } from '../lib/csvImport';
import AdvancedFiltersPanel, { AdvancedFilters } from '../components/AdvancedFiltersPanel';
import UsageBanner from '../components/UsageBanner';
import UpgradeModal from '../components/UpgradeModal';
import BulkOperations from '../components/BulkOperations';
import ProductPerformanceAnalyzer from '../components/ProductPerformanceAnalyzer';
import PriceOptimizerButton from '../components/PriceOptimizerButton';
import ProductLimitBlur from '../components/ProductLimitBlur';
import { validateProduct } from '../lib/validation';

const Products: React.FC = () => {
  const { showToast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, loadProducts } = useSupabaseStore();
  const { canCreateProduct, hasFeature } = useSubscription();
  const { redirectToUpgrade, isFreeUser } = useUpgradeRedirect();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('');
  const [upgradeLimitType, setUpgradeLimitType] = useState<string>('');
  const bulkSelection = useBulkSelection<Product>();
  const { presets, savePreset, deletePreset } = useFilterPresets('products');
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvImportResults, setCsvImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [sortField, setSortField] = useState<keyof Product>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Load products on mount
  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.asin?.toLowerCase().includes(searchLower) ||
        product.merchant_sku?.toLowerCase().includes(searchLower) ||
        product.supplier_name?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.supplier && filters.supplier !== 'all') {
      filtered = filtered.filter(product => product.supplier_id === filters.supplier);
    }

    if (filters.minProfit !== undefined) {
      filtered = filtered.filter(product => (product.estimated_profit || 0) >= filters.minProfit!);
    }

    if (filters.maxProfit !== undefined) {
      filtered = filtered.filter(product => (product.estimated_profit || 0) <= filters.maxProfit!);
    }

    if (filters.minROI !== undefined) {
      filtered = filtered.filter(product => (product.roi_percentage || 0) >= filters.minROI!);
    }

    if (filters.maxROI !== undefined) {
      filtered = filtered.filter(product => (product.roi_percentage || 0) <= filters.maxROI!);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(product => 
        new Date(product.created_at) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(product => 
        new Date(product.created_at) <= new Date(filters.dateTo!)
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [products, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Product) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleAdd = () => {
    if (!canCreateProduct) {
      setUpgradeFeature('Yeni Ürün Ekle');
      setUpgradeLimitType('products');
      setShowUpgradeModal(true);
      return;
    }
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      showToast('Ürün başarıyla silindi', 'success');
      setShowDeleteModal(null);
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    }
  };

  const handleSubmit = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showToast('Ürün başarıyla güncellendi', 'success');
      } else {
        await addProduct(productData as any);
        showToast('Ürün başarıyla eklendi', 'success');
      }
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    }
  };

  const handleBulkEdit = async (updates: Partial<Product>) => {
    try {
      const selectedProducts = Array.from(bulkSelection.selectedItems).map(id => 
        products.find(p => p.id === id)
      ).filter(Boolean) as Product[];
      
      const promises = selectedProducts.map(product =>
        updateProduct(product.id, updates)
      );
      await Promise.all(promises);
      showToast(`${selectedProducts.length} ürün güncellendi`, 'success');
      bulkSelection.clearSelection();
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    }
  };

  const handleBulkDelete = async () => {
    const selectedProducts = Array.from(bulkSelection.selectedItems).map(id => 
      products.find(p => p.id === id)
    ).filter(Boolean) as Product[];
    
    if (!confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`)) return;
    
    try {
      const promises = selectedProducts.map(product =>
        deleteProduct(product.id)
      );
      await Promise.all(promises);
      showToast(`${selectedProducts.length} ürün silindi`, 'success');
      bulkSelection.clearSelection();
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    }
  };

  const handleImport = () => {
    if (!hasFeature('csvExport')) {
      redirectToUpgrade('CSV İçe Aktar');
      return;
    }
    setShowImportModal(true);
  };

  const handleCSVUpload = async (file: File) => {
    try {
      const results = await processCSVFile(file, addProduct as any);
      setCsvImportResults({
        success: results.success ? results.products.length : 0,
        failed: results.errors.length,
        errors: results.errors
      });
      showToast(`CSV içe aktarma tamamlandı: ${results.success ? results.products.length : 0} başarılı, ${results.errors.length} başarısız`, 'success');
    } catch (error: any) {
      showToast(`CSV içe aktarma hatası: ${error.message}`, 'error');
    }
  };

  const handleDownloadTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urun-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (products.length === 0 && !showAddModal) {
    return (
      <div className="space-y-6 max-w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📦 Ürün Yönetimi</h1>
            <p className="mt-2 text-sm text-gray-600">
              Ürünlerinizi görüntüleyin, ekleyin, düzenleyin ve silin
            </p>
          </div>
        </div>

        <div className="text-center py-12">
          <span className="mx-auto text-6xl text-gray-400">📦</span>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz ürün yok</h3>
          <p className="mt-1 text-sm text-gray-500">
            İlk ürününüzü ekleyerek başlayın
          </p>
          <div className="mt-6">
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <span>➕</span>
              <span>İlk Ürünü Ekle</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Ürün Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ürünlerinizi görüntüleyin, ekleyin, düzenleyin ve silin
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
            {isFreeUser && (
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                🔒 Pro
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFiltersPanel
        filters={filters}
        onChange={setFilters}
        savedPresets={presets}
        onSavePreset={savePreset}
        onDeletePreset={deletePreset}
        type="products"
      />

      {/* Usage Banner */}
      <UsageBanner />

      {/* Bulk Operations */}
      {isFreeUser ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Toplu İşlemler</h3>
            <p className="text-gray-600 mb-4">Çoklu ürün düzenleme, silme ve dışa aktarma</p>
            <button
              onClick={() => redirectToUpgrade('Toplu İşlemler')}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <span>🔒</span>
              <span>Pro ile Kullan</span>
            </button>
          </div>
        </div>
      ) : (
        <BulkOperations
          selectedCount={bulkSelection.selectedCount}
          selectedItems={bulkSelection.selectedItems}
          allItems={products}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          onClearSelection={bulkSelection.clearSelection}
        />
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ürünler ({filteredProducts.length})
            </h2>
            <div className="flex items-center space-x-4">
              {Object.keys(filters).length > 0 && (
                <span className="text-sm text-gray-500">
                  {Object.keys(filters).length} filtre aktif
                </span>
              )}
              {totalPages > 1 && (
                <span className="text-sm text-gray-500">
                  Sayfa {currentPage}/{totalPages}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table min-w-full" style={{ minWidth: '1200px' }}>
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
                <th className="table-header-cell" style={{ minWidth: '150px', maxWidth: '150px' }}>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Ürün Adı</span>
                    <span className="text-sm">{getSortIcon('name')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '80px', maxWidth: '80px' }}>
                  <button
                    onClick={() => handleSort('asin')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>ASIN</span>
                    <span className="text-sm">{getSortIcon('asin')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '90px', maxWidth: '90px' }}>
                  <button
                    onClick={() => handleSort('merchant_sku')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Merchant SKU</span>
                    <span className="text-sm">{getSortIcon('merchant_sku')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                  <button
                    onClick={() => handleSort('supplier_name')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Tedarikçi</span>
                    <span className="text-sm">{getSortIcon('supplier_name')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                  <button
                    onClick={() => handleSort('product_cost')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Maliyet</span>
                    <span className="text-sm">{getSortIcon('product_cost')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                  <button
                    onClick={() => handleSort('estimated_profit')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Kar</span>
                    <span className="text-sm">{getSortIcon('estimated_profit')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '80px', maxWidth: '80px' }}>
                  <button
                    onClick={() => handleSort('roi_percentage')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>ROI %</span>
                    <span className="text-sm">{getSortIcon('roi_percentage')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Oluşturulma</span>
                    <span className="text-sm">{getSortIcon('created_at')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '120px', maxWidth: '120px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              <ProductLimitBlur currentCount={products.length} limit={10}>
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
                    <td className="table-cell" style={{ minWidth: '150px', maxWidth: '150px' }}>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate text-sm" title={product.name}>
                          {product.name}
                        </div>
                        {product.amazon_barcode && (
                          <div className="text-xs text-gray-500 truncate">
                            Barkod: {product.amazon_barcode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell" style={{ minWidth: '80px', maxWidth: '80px' }}>
                      <code className="bg-gray-100 px-1 py-1 rounded text-xs font-mono block truncate" title={product.asin}>
                        {product.asin}
                      </code>
                    </td>
                    <td className="table-cell" style={{ minWidth: '90px', maxWidth: '90px' }}>
                      <code className="bg-gray-100 px-1 py-1 rounded text-xs font-mono block truncate" title={product.merchant_sku}>
                        {product.merchant_sku}
                      </code>
                    </td>
                    <td className="table-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                      {product.supplier_name ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 truncate text-sm">
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
                    <td className="table-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                      {product.product_cost ? (
                        <span className="font-semibold text-green-600">
                          ${product.product_cost.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                      {product.estimated_profit !== undefined && product.estimated_profit !== null ? (
                        <div className="flex flex-col">
                          <span className={`font-bold ${product.estimated_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${product.estimated_profit.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {product.roi_percentage ? `${product.roi_percentage.toFixed(1)}% ROI` : 'ROI hesaplanmadı'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Hesaplanmadı</span>
                      )}
                    </td>
                    <td className="table-cell" style={{ minWidth: '80px', maxWidth: '80px' }}>
                      {product.roi_percentage ? (
                        <span className={`font-semibold ${product.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.roi_percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                      <div className="text-sm text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="table-cell" style={{ minWidth: '120px', maxWidth: '120px' }}>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✏️ Düzenle
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(product)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ProductPerformanceAnalyzer product={product} />
                          <PriceOptimizerButton product={product} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </ProductLimitBlur>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {filteredProducts.length} üründen {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} arası gösteriliyor
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showAddModal && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSuccess={handleSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ürünü Sil</h3>
            <p className="text-gray-600 mb-6">
              "{showDeleteModal.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">CSV İçe Aktar</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 CSV Formatı</h4>
                <p className="text-sm text-blue-700 mb-2">
                  CSV dosyanızda şu sütunlar bulunmalıdır:
                </p>
                <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
                  <li>name (Ürün Adı) - Zorunlu</li>
                  <li>asin (ASIN) - Opsiyonel</li>
                  <li>merchant_sku (Merchant SKU) - Opsiyonel</li>
                  <li>supplier_name (Tedarikçi Adı) - Opsiyonel</li>
                  <li>product_cost (Ürün Maliyeti) - Opsiyonel</li>
                </ul>
              </div>

              <div className="flex items-center space-x-4">
                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCSVUpload(file);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => csvFileInputRef.current?.click()}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>📁</span>
                  <span>Dosya Seç</span>
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>📥</span>
                  <span>Template İndir</span>
                </button>
              </div>

              {csvImportResults && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-1">✅ Başarılı</h4>
                      <p className="text-2xl font-bold text-green-600">{csvImportResults.success}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-1">❌ Başarısız</h4>
                      <p className="text-2xl font-bold text-red-600">{csvImportResults.failed}</p>
                    </div>
                  </div>

                  {csvImportResults.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Hata Detayları</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {csvImportResults.errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-700 mb-1">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvImportResults(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType={upgradeLimitType as "products" | "shipments" | "general"}
          feature={upgradeFeature}
        />
      )}
    </div>
  );
};

// Product Modal Component
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: (product: Partial<Product>) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    asin: product?.asin || '',
    merchant_sku: product?.merchant_sku || '',
    amazon_barcode: product?.amazon_barcode || '',
    supplier_name: product?.supplier_name || '',
    supplier_country: product?.supplier_country || '',
    manufacturer_code: product?.manufacturer_code || '',
    product_cost: product?.product_cost || '',
    // Premium fields
    amazon_price: product?.amazon_price || '',
    referral_fee_percent: product?.referral_fee_percent || '',
    fulfillment_fee: product?.fulfillment_fee || '',
    advertising_cost: product?.advertising_cost || '',
    initial_investment: product?.initial_investment || '',
    units_sold: product?.units_sold || '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name, company, country')
          .order('name');
        
        if (error) throw error;
        setSuppliers(data || []);
      } catch (error: any) {
        console.error('Tedarikçiler yüklenemedi:', error.message);
      }
    };

    loadSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const productData = {
        name: formData.name,
        asin: formData.asin || undefined,
        merchant_sku: formData.merchant_sku || undefined,
        amazon_barcode: formData.amazon_barcode || undefined,
        supplier_name: formData.supplier_name || undefined,
        supplier_country: formData.supplier_country || undefined,
        manufacturer_code: formData.manufacturer_code || undefined,
        product_cost: formData.product_cost ? parseFloat(formData.product_cost.toString()) : undefined,
        // Premium fields
        amazon_price: formData.amazon_price ? parseFloat(formData.amazon_price.toString()) : undefined,
        referral_fee_percent: formData.referral_fee_percent ? parseFloat(formData.referral_fee_percent.toString()) : undefined,
        fulfillment_fee: formData.fulfillment_fee ? parseFloat(formData.fulfillment_fee.toString()) : undefined,
        advertising_cost: formData.advertising_cost ? parseFloat(formData.advertising_cost.toString()) : undefined,
        initial_investment: formData.initial_investment ? parseFloat(formData.initial_investment.toString()) : undefined,
        units_sold: formData.units_sold ? parseInt(formData.units_sold.toString()) : undefined,
      };

      const validation = validateProduct(productData);
      if (!validation.isValid) {
        showToast(`Hata: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      await onSuccess(productData as any);
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label required">Ürün Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Ürün adını girin"
                required
              />
            </div>

            <div>
              <label className="label">ASIN</label>
              <input
                type="text"
                value={formData.asin}
                onChange={(e) => setFormData({ ...formData, asin: e.target.value })}
                className="input-field"
                placeholder="B01ABC123D"
              />
            </div>

            <div>
              <label className="label">Merchant SKU</label>
              <input
                type="text"
                value={formData.merchant_sku}
                onChange={(e) => setFormData({ ...formData, merchant_sku: e.target.value })}
                className="input-field"
                placeholder="SKU-123456"
              />
            </div>

            <div>
              <label className="label">Amazon Barkod</label>
              <input
                type="text"
                value={formData.amazon_barcode}
                onChange={(e) => setFormData({ ...formData, amazon_barcode: e.target.value })}
                className="input-field"
                placeholder="1234567890123"
              />
            </div>

            <div>
              <label className="label">Tedarikçi</label>
              <select
                value={formData.supplier_name}
                onChange={(e) => {
                  const selectedSupplier = suppliers.find(s => s.name === e.target.value);
                  setFormData({ 
                    ...formData, 
                    supplier_name: e.target.value,
                    supplier_country: selectedSupplier?.country || ''
                  });
                }}
                className="input-field"
              >
                <option value="">Tedarikçi seçin</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name} {supplier.company && `(${supplier.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tedarikçi Ülkesi</label>
              <input
                type="text"
                value={formData.supplier_country}
                onChange={(e) => setFormData({ ...formData, supplier_country: e.target.value })}
                className="input-field"
                placeholder="Tedarikçi seçildiğinde otomatik doldurulur"
                readOnly
              />
            </div>

            <div>
              <label className="label">Üretici Kodu</label>
              <input
                type="text"
                value={formData.manufacturer_code}
                onChange={(e) => setFormData({ ...formData, manufacturer_code: e.target.value })}
                className="input-field"
                placeholder="MFG-123"
              />
            </div>

            <div>
              <label className="label">Ürün Maliyeti ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.product_cost}
                onChange={(e) => setFormData({ ...formData, product_cost: e.target.value })}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Premium Features Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🚀</span>
              <h4 className="text-lg font-bold text-gray-900">Premium Özellikler</h4>
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
                PRO
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Amazon Fiyatı ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amazon_price}
                  onChange={(e) => setFormData({ ...formData, amazon_price: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Referans Ücreti (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.referral_fee_percent}
                  onChange={(e) => setFormData({ ...formData, referral_fee_percent: e.target.value })}
                  className="input-field"
                  placeholder="15.00"
                />
              </div>

              <div>
                <label className="label">Fulfillment Ücreti ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.fulfillment_fee}
                  onChange={(e) => setFormData({ ...formData, fulfillment_fee: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Reklam Maliyeti ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.advertising_cost}
                  onChange={(e) => setFormData({ ...formData, advertising_cost: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">İlk Yatırım ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initial_investment}
                  onChange={(e) => setFormData({ ...formData, initial_investment: e.target.value })}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="label">Satılan Adet</label>
                <input
                  type="number"
                  value={formData.units_sold}
                  onChange={(e) => setFormData({ ...formData, units_sold: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Pro özellik:</strong> Bu alanlar otomatik kar hesaplama ve ROI analizi için kullanılır.
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Ürün hakkında notlar..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Kaydediliyor...' : (product ? 'Güncelle' : 'Ekle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;