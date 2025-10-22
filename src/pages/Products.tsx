import React, { useState, useMemo, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import { Product } from '../types';
import { processCSVFile, getCSVTemplate } from '../lib/csvImport';
import { searchProducts, SearchFilters } from '../lib/smartSearch';
import AdvancedSearch from '../components/AdvancedSearch';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateProduct, ValidationResult } from '../lib/validation';

const Products: React.FC = () => {
  const { showToast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, loadProducts } = useSupabaseStore();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: '',
    manufacturer: 'all',
    priceRange: { min: 0, max: 1000 }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    products: any[];
    errors: string[];
    duplicates: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load products on component mount
  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtered products using advanced search
  const searchResult = useMemo(() => {
    return searchProducts(products, searchFilters);
  }, [products, searchFilters]);

  const filteredProducts = searchResult.items;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleClearSearch = () => {
    setSearchFilters({
      searchTerm: '',
      manufacturer: 'all',
      priceRange: { min: 0, max: 1000 }
    });
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
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleImport = () => {
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

  const handleConfirmImport = () => {
    if (importResults?.success && importResults.products.length > 0) {
      importResults.products.forEach(product => {
        addProduct(product);
      });
      showToast(`${importResults.products.length} ürün başarıyla eklendi!`, 'success');
      setShowImportModal(false);
      setImportResults(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-full">
        <LoadingSpinner fullScreen text="Ürünler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
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

      {/* Advanced Search */}
      <div className="card">
        <AdvancedSearch
          onSearch={handleSearch}
          onClear={handleClearSearch}
          searchType="product"
          placeholder="Ürün adı, ASIN, SKU veya üretici ile akıllı arama..."
        />
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Ürünler ({filteredProducts.length})
          </h3>
          <p className="card-subtitle">
            Toplam {products.length} ürün • {searchResult.appliedFilters.searchTerm ? 'Arama sonuçları' : 'Tüm ürünler'}
            {searchResult.appliedFilters.manufacturer !== 'all' && ` • ${searchResult.appliedFilters.manufacturer} üreticisi`}
            {searchResult.appliedFilters.priceRange && searchResult.appliedFilters.priceRange.min > 0 && 
              ` • $${searchResult.appliedFilters.priceRange.min}-${searchResult.appliedFilters.priceRange.max} fiyat aralığı`}
          </p>
        </div>

        <div className="mobile-table">
          <table className="table min-w-full">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell w-64">Ürün Adı</th>
                <th className="table-header-cell w-32">ASIN</th>
                <th className="table-header-cell w-32">Merchant SKU</th>
                <th className="table-header-cell w-24">Üretici</th>
                <th className="table-header-cell w-24">Üretici Kodu</th>
                <th className="table-header-cell w-28">Ürün Maliyeti</th>
                <th className="table-header-cell w-24">Oluşturulma</th>
                <th className="table-header-cell w-24">İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="table-row">
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
                  <td className="table-cell w-24">
                    {product.manufacturer ? (
                      <span className="badge badge-info truncate block">
                        {product.manufacturer}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
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

        {filteredProducts.length === 0 && (
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
              addProduct({ ...product, id: Date.now().toString() });
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
  const [formData, setFormData] = useState({
    name: product?.name || '',
    asin: product?.asin || '',
    merchant_sku: product?.merchant_sku || '',
    manufacturer_code: product?.manufacturer_code || '',
    manufacturer: product?.manufacturer || '',
    amazon_barcode: product?.amazon_barcode || '',
    product_cost: product?.product_cost || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
            <label className="label">Üretici</label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="input-field"
              placeholder="Üretici adı"
            />
          </div>

          <div>
            <label className="label">Üretici Kodu</label>
            <input
              type="text"
              value={formData.manufacturer_code}
              onChange={(e) => setFormData({ ...formData, manufacturer_code: e.target.value })}
              className="input-field"
              placeholder="Üretici kodu"
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
