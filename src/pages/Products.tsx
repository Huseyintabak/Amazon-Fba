import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useStore } from '../stores/useStore';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useUpgradeRedirect } from '../hooks/useUpgradeRedirect';
import { useBulkSelection } from '../hooks/useBulkSelection';
import { useSearch } from '../hooks/useSearch';
// import { useFilterPresets } from '../hooks/useFilterPresets';
import { Product, Category } from '../types';
import { processCSVFile, getCSVTemplate } from '../lib/csvImport';
import { exportProductsForUpdate } from '../lib/csvExport';
import { AdvancedFilters } from '../components/AdvancedFiltersPanel';
import UsageBanner from '../components/UsageBanner';
import UpgradeModal from '../components/UpgradeModal';
import ProductModal from './Products/components/ProductModal';
import BulkOperations from '../components/BulkOperations';
import ProductPerformanceAnalyzer from '../components/ProductPerformanceAnalyzer';
import PriceOptimizerButton from '../components/PriceOptimizerButton';
import ProductLimitBlur from '../components/ProductLimitBlur';
import ResizableTable from '../components/ResizableTable';
import Pagination from '../components/Pagination';
import { validateProduct } from '../lib/validation';
import CategoryManager from '../components/CategoryManager';
import ImageUpload from '../components/ImageUpload';

const Products: React.FC = () => {
  const { showToast } = useToast();
  const { addProduct, updateProduct, deleteProduct } = useStore();
  const { canCreateProduct, hasFeature } = useSubscription();
  const { redirectToUpgrade, isFreeUser } = useUpgradeRedirect();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('');
  const [upgradeLimitType, setUpgradeLimitType] = useState<string>('');
  const bulkSelection = useBulkSelection<Product>();
  // const { presets, savePreset, deletePreset } = useFilterPresets('products');
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [csvImportResults, setCsvImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [importMode, setImportMode] = useState<'create' | 'update'>('create');
  const [sortField, setSortField] = useState<keyof Product>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Category and image management
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Simple state management
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = {
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min((currentPage - 1) * itemsPerPage + itemsPerPage - 1, totalItems - 1),
  };

  // Load products function
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('products')
        .select(`
          *,
          suppliers!left(name, country),
          categories!left(name, color, icon)
        `, { count: 'exact' });

      // Only filter by user_id if not admin
      if (!profile?.is_admin) {
        query = query.eq('user_id', user.id);
      }

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.trim();
        if (searchTerm.length >= 2) {
          const searchLower = searchTerm.toLowerCase();
          query = query.or(`name.ilike.%${searchLower}%,asin.ilike.%${searchLower}%,merchant_sku.ilike.%${searchLower}%,suppliers.name.ilike.%${searchLower}%`);
        }
      }

      if (filters.supplier) {
        query = query.eq('supplier_id', filters.supplier);
      }

      if (filters.costRange?.min !== undefined) {
        query = query.gte('product_cost', filters.costRange.min);
      }

      if (filters.costRange?.max !== undefined) {
        query = query.lte('product_cost', filters.costRange.max);
      }

      if (filters.dateRange?.startDate) {
        query = query.gte('created_at', filters.dateRange.startDate);
      }

      if (filters.dateRange?.endDate) {
        query = query.lte('created_at', filters.dateRange.endDate);
      }

      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to include supplier info
      const transformedData = data?.map(product => ({
        ...product,
        supplier_name: product.suppliers?.name || '',
        supplier_country: product.suppliers?.country || ''
      })) || [];

      setProducts(transformedData);
      setTotalItems(count || 0);
    } catch (error: unknown) {
      console.error('Error loading products:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setProductsError(errorMessage);
      showToast(`Ürünler yüklenemedi: ${errorMessage}`, 'error');
    } finally {
      setProductsLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, sortField, sortDirection, showToast]);

  // Load products on mount and when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Simple functions
  const refreshProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Search with debounce
  const searchProducts = useCallback(async () => {
    // This will trigger the pagination reload
    return [];
  }, []);

  const { handleSearch, clearSearch } = useSearch(searchProducts, {
    debounceMs: 300,
    minLength: 2
  });

  // Search input handler
  const handleSearchInput = (value: string) => {
    setFilters({ ...filters, search: value });
    handleSearch(value);
    // Reset to first page when search changes
    goToPage(1);
  };

  // Sort handler
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    goToPage(1);
  };

  // Loading state
  if (productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Hata: {productsError}</p>
        <button 
          onClick={refreshProducts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }


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

  // Update Product Function for CSV Import
  const updateProductLocal = async (productId: string, productData: Partial<Product>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Kullanıcı bulunamadı');

    const { error } = await supabase
      .from('products')
      .update({
        ...productData,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  // CSV Import Functions
  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 CSV Import başladı!', event.target.files);
    
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ Dosya seçilmedi');
      return;
    }

    console.log('📁 Seçilen dosya:', file.name, file.size, 'bytes');

    try {
      // Get fresh products data from database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data: freshProducts, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('🔍 CSV Import Debug:', {
        productsCount: freshProducts?.length || 0,
        importMode,
        firstProduct: freshProducts?.[0]?.asin
      });
      
      const result = await processCSVFile(file, freshProducts || [], importMode === 'update');
      
      if (result.success && (result.products.length > 0 || result.updates.length > 0)) {
        let successCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        // Handle new products (create mode)
        if (importMode === 'create' && result.products.length > 0) {
          for (const productData of result.products) {
            try {
              await addProduct(productData as Product);
              successCount++;
            } catch (error) {
              failedCount++;
              errors.push(`Ürün eklenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            }
          }
        }

        // Handle updates (update mode)
        if (importMode === 'update' && result.updates.length > 0) {
          for (const productData of result.updates) {
            try {
              console.log('🔄 Updating product:', {
                id: productData.id,
                asin: productData.asin,
                name: productData.name
              });
              
              await updateProductLocal(productData.id!, productData as Product);
              successCount++;
            } catch (error) {
              failedCount++;
              console.error('❌ Update error:', error);
              errors.push(`Ürün güncellenemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
            }
          }
        }

        setCsvImportResults({
          success: successCount,
          failed: failedCount,
          errors: [...result.errors, ...errors]
        });

        if (successCount > 0) {
          const action = importMode === 'create' ? 'eklendi' : 'güncellendi';
          console.log(`🎉 ${successCount} ürün başarıyla ${action}!`);
          showToast(`${successCount} ürün başarıyla ${action}!`, 'success');
          
          console.log('🔄 Ürün listesi yenileniyor...');
          await loadProducts(); // Refresh the list
          console.log('✅ Ürün listesi yenilendi!');
          
          // Close modal after successful import
          setTimeout(() => {
            console.log('🚪 Modal kapatılıyor...');
            setShowImportModal(false);
            setCsvImportResults(null);
            setImportMode('create');
          }, 1000); // 1 saniye bekle, sonra kapat
        }
      } else {
        setCsvImportResults({
          success: 0,
          failed: result.products.length + result.updates.length,
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('💥 CSV Import hatası:', error);
      setCsvImportResults({
        success: 0,
        failed: 1,
        errors: [`Dosya işlenirken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`]
      });
    }

    // Reset file input
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = '';
    }
  };

  const downloadCSVTemplate = () => {
    const template = getCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'urun_sablonu.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (products.length === 0) {
      showToast('Dışa aktarılacak ürün bulunamadı', 'warning');
      return;
    }

    try {
      exportProductsForUpdate(products);
      showToast(`${products.length} ürün CSV olarak dışa aktarıldı!`, 'success');
    } catch (error) {
      showToast(`Dışa aktarma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, 'error');
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      showToast('Ürün başarıyla silindi', 'success');
      setShowDeleteModal(null);
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`, 'error');
    }
  };

  const handleSubmit = async (productData: Partial<Product>) => {
    try {
      console.log('handleSubmit called with:', productData);
      if (editingProduct) {
        console.log('Updating product:', editingProduct.id, 'with data:', productData);
        const updatedProduct = await updateProduct(editingProduct.id, productData);
        console.log('Updated product received:', updatedProduct);
        
        if (updatedProduct) {
          // State'i direkt güncelle
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...updatedProduct } : p));
          showToast('Ürün başarıyla güncellendi', 'success');
        } else {
          console.error('Updated product is undefined');
          showToast('Ürün güncellenemedi', 'error');
        }
      } else {
        const newProduct = await addProduct(productData as any);
        // State'e yeni ürünü ekle
        setProducts(prev => [newProduct, ...prev]);
        showToast('Ürün başarıyla eklendi', 'success');
      }
      setShowAddModal(false);
      setEditingProduct(null);
    } catch (error: unknown) {
      console.error('handleSubmit error:', error);
      showToast(`Hata: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`, 'error');
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
      await refreshProducts(); // Auto-refresh after bulk edit
      showToast(`${selectedProducts.length} ürün güncellendi`, 'success');
      bulkSelection.clearSelection();
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`, 'error');
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
      await refreshProducts(); // Auto-refresh after bulk delete
      showToast(`${selectedProducts.length} ürün silindi`, 'success');
      bulkSelection.clearSelection();
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`, 'error');
    }
  };

  const handleImport = () => {
    // CSV Import is now available for all users
    setShowImportModal(true);
  };

  const handleCSVUpload = async (file: File, updateMode: boolean = false) => {
    try {
      const results = await processCSVFile(file, products, updateMode);
      
      if (updateMode) {
        // Update existing products
        if (results.updates && results.updates.length > 0) {
          const updatePromises = results.updates.map(product => updateProduct(product.id, product));
          await Promise.all(updatePromises);
          await refreshProducts(); // Refresh the list
        }
        
        setCsvImportResults({
          success: results.updates ? results.updates.length : 0,
          failed: results.errors.length,
          errors: results.errors
        });
        
        showToast(`CSV güncelleme tamamlandı: ${results.updates ? results.updates.length : 0} güncellendi, ${results.errors.length} hata`, 'success');
      } else {
        // Create new products
        if (results.products && results.products.length > 0) {
          const createPromises = results.products.map(product => addProduct(product));
          await Promise.all(createPromises);
          await refreshProducts(); // Refresh the list
        }
        
        setCsvImportResults({
          success: results.products ? results.products.length : 0,
          failed: results.errors.length,
          errors: results.errors
        });
        
        showToast(`CSV içe aktarma tamamlandı: ${results.products ? results.products.length : 0} başarılı, ${results.errors.length} başarısız`, 'success');
      }
    } catch (error: unknown) {
      showToast(`CSV işleme hatası: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)}`, 'error');
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
            onClick={() => setShowCategoryManager(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>🏷️</span>
            <span>Kategori Yönetimi</span>
          </button>
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
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>📤</span>
            <span>CSV Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="🔍 Ürün adı, ASIN, Merchant SKU veya tedarikçi adı ile ara..."
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {filters.search && (
            <button
              onClick={() => {
                setFilters({ ...filters, search: '' });
                clearSearch();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

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
              Ürünler ({pagination.totalItems})
            </h2>
            <div className="flex items-center space-x-4">
              {Object.keys(filters).length > 0 && (
                <span className="text-sm text-gray-500">
                  {Object.keys(filters).length} filtre aktif
                </span>
              )}
            </div>
          </div>
          </div>

        <div className="overflow-x-auto">
          <ResizableTable>
            <table className="table min-w-full" style={{ minWidth: '1200px' }}>
            <thead className="table-header">
              <tr>
                <th className="table-header-cell w-12">
                  <input
                    type="checkbox"
                    checked={bulkSelection.isAllSelected(products)}
                    onChange={() => bulkSelection.toggleAll(products)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    title="Tümünü seç/kaldır"
                  />
                </th>
                <th className="table-header-cell">
                  <span>Resim</span>
                </th>
                <th className="table-header-cell">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Ürün Adı</span>
                    <span className="text-sm">{getSortIcon('name')}</span>
                  </button>
                </th>
                <th className="table-header-cell">
                  <span>Kategori</span>
                </th>
                <th className="table-header-cell">
                  <button
                    onClick={() => handleSort('asin')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>ASIN</span>
                    <span className="text-sm">{getSortIcon('asin')}</span>
                  </button>
                </th>
                <th className="table-header-cell">
                  <button
                    onClick={() => handleSort('merchant_sku')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Merchant SKU</span>
                    <span className="text-sm">{getSortIcon('merchant_sku')}</span>
                  </button>
                </th>
                <th className="table-header-cell">
                  <button
                    onClick={() => handleSort('supplier_name')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Tedarikçi</span>
                    <span className="text-sm">{getSortIcon('supplier_name')}</span>
                  </button>
                </th>
                <th className="table-header-cell">
                  <button
                    onClick={() => handleSort('product_cost')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Maliyet</span>
                    <span className="text-sm">{getSortIcon('product_cost')}</span>
                  </button>
                </th>
                <th className="table-header-cell">
                  <button
                    onClick={() => handleSort('estimated_profit')}
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>Kar</span>
                    <span className="text-sm">{getSortIcon('estimated_profit')}</span>
                  </button>
                </th>
                <th className="table-header-cell" style={{ minWidth: '120px', maxWidth: '120px' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              <ProductLimitBlur currentCount={pagination.totalItems} limit={10}>
              {products.map((product) => (
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
                    <td className="table-cell">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-gray-400 text-xs">
                          📷
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
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
                    <td className="table-cell">
                      {product.category ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: product.category.color }}
                          >
                            {product.category.icon}
                          </div>
                          <span className="text-sm text-gray-900 truncate">
                            {product.category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <code className="bg-gray-100 px-1 py-1 rounded text-xs font-mono block truncate" title={product.asin}>
                      {product.asin}
                    </code>
                  </td>
                    <td className="table-cell">
                      <code className="bg-gray-100 px-1 py-1 rounded text-xs font-mono block truncate" title={product.merchant_sku}>
                      {product.merchant_sku}
                    </code>
                  </td>
                    <td className="table-cell">
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
                    <td className="table-cell">
                    {product.product_cost ? (
                      <span className="font-semibold text-green-600">
                        ${product.product_cost.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                    <td className="table-cell">
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
                    <td className="table-cell">
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
          </ResizableTable>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={goToPage}
              onItemsPerPageChange={setItemsPerPage}
              loading={productsLoading}
              showItemsPerPage={true}
            />
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
          onSuccess={async (productData) => {
            console.log('🎯 ProductModal onSuccess called with:', productData);
            try {
              if (editingProduct) {
                // Update existing product
                console.log('🔄 Updating product:', editingProduct.id);
                await updateProduct(editingProduct.id, productData);
                showToast('Ürün başarıyla güncellendi!', 'success');
              } else {
                // Add new product
                console.log('➕ Adding new product');
                await addProduct(productData as Omit<Product, 'id' | 'updated_at' | 'created_at' | 'user_id'>);
                showToast('Ürün başarıyla eklendi!', 'success');
              }
              console.log('🔄 Loading products...');
              loadProducts();
            } catch (error) {
              console.error('💥 ProductModal onSuccess error:', error);
              showToast(`Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, 'error');
            }
          }}
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
          <div className="modal-content max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">CSV İçe Aktar</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setCsvImportResults(null);
                  setImportMode('create');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {!csvImportResults ? (
              <div className="space-y-6">
                {/* Import Mode Selection */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">🎯 İşlem Türü</h4>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="create"
                        checked={importMode === 'create'}
                        onChange={(e) => setImportMode(e.target.value as 'create' | 'update')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">➕ Yeni Ürün Ekle</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="importMode"
                        value="update"
                        checked={importMode === 'update'}
                        onChange={(e) => setImportMode(e.target.value as 'create' | 'update')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">✏️ Mevcut Ürünleri Güncelle</span>
                    </label>
                  </div>
                  {importMode === 'update' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <strong>⚠️ Güncelleme Modu:</strong> ASIN veya Merchant SKU ile mevcut ürünleri bulup güncelleyecek. 
                        Bulunamayan ürünler için hata verilecek.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📋 CSV Formatı</h4>
                  <p className="text-blue-800 text-sm mb-2">
                    CSV dosyanızda şu sütunlar bulunmalı:
                  </p>
                  <div className="text-xs text-blue-700 grid grid-cols-2 gap-1">
                    <span>• Ürün Adı (zorunlu)</span>
                    <span>• ASIN (zorunlu)</span>
                    <span>• Merchant SKU (zorunlu)</span>
                    <span>• Üretici</span>
                    <span>• Üretici Kodu</span>
                    <span>• Amazon Barkod</span>
                    <span>• Ürün Maliyeti</span>
                    <span>• Tedarikçi Adı</span>
                    <span>• Tedarikçi Ülkesi</span>
                    <span>• Amazon Fiyatı</span>
                    <span>• Referans Ücreti</span>
                    <span>• Fulfillment Ücreti</span>
                    <span>• Reklam Maliyeti</span>
                    <span>• İlk Yatırım</span>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    className="hidden"
                  />
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">CSV dosyanızı seçin</p>
                  <button
                    onClick={() => csvFileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Dosya Seç
                  </button>
                </div>

                {/* Template Download */}
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Örnek CSV şablonu indirin:</p>
                  <button
                    onClick={downloadCSVTemplate}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    📥 CSV Şablonu İndir
                  </button>
                </div>
              </div>
            ) : (
              /* Import Results */
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${csvImportResults.success > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h4 className={`font-semibold mb-2 ${csvImportResults.success > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {csvImportResults.success > 0 ? '✅ İçe Aktarma Başarılı!' : '❌ İçe Aktarma Başarısız!'}
                  </h4>
                  <div className="text-sm">
                    <p className={csvImportResults.success > 0 ? 'text-green-800' : 'text-red-800'}>
                      Başarılı: {csvImportResults.success} ürün
                    </p>
                    <p className="text-red-800">
                      Başarısız: {csvImportResults.failed} ürün
                    </p>
                  </div>
                </div>

                {csvImportResults.errors.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-red-900 mb-2">Hatalar:</h5>
                    <div className="text-sm text-red-800 max-h-32 overflow-y-auto">
                      {csvImportResults.errors.map((error, index) => (
                        <p key={index} className="mb-1">• {error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setCsvImportResults(null);
                      setImportMode('create');
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => {
                      setCsvImportResults(null);
                      setImportMode('create');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Yeni İçe Aktar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Manager */}
      <CategoryManager
        isOpen={showCategoryManager}
        onClose={() => setShowCategoryManager(false)}
        mode="manage"
      />

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

export default Products;
