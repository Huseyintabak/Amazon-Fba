import React from 'react';
import { Product, ShipmentItem } from '../../../types';

interface ShipmentProductsProps {
  selectedProducts: ShipmentItem[];
  unitShippingCost: number;
  totalShippingCost: number;
  scannedItems: Set<string>;
  missingItems: string[];
  showProductSelector: boolean;
  searchTerm: string;
  filteredProducts: Product[];
  errors: Record<string, string>;
  totalQuantity: number;
  onToggleProductSelector: () => void;
  onSearchChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveProduct: (itemId: string) => void;
}

export const ShipmentProducts: React.FC<ShipmentProductsProps> = ({
  selectedProducts,
  unitShippingCost,
  totalShippingCost,
  scannedItems,
  missingItems,
  showProductSelector,
  searchTerm,
  filteredProducts,
  errors,
  totalQuantity,
  onToggleProductSelector,
  onSearchChange,
  onProductSelect,
  onUpdateQuantity,
  onRemoveProduct
}) => {
  return (
    <>
      {/* Product Selection */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Ürün Ekleme</h3>
            <button
              onClick={onToggleProductSelector}
              className="btn-primary flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Ürün Ekle</span>
            </button>
          </div>
        </div>

        {showProductSelector && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative mb-4">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">📦</span>
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        ASIN: {product.asin} | SKU: {product.merchant_sku}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onProductSelect(product)}
                    className="btn-sm btn-primary"
                  >
                    Ekle
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.products && <p className="error-message">{errors.products}</p>}
      </div>

      {/* Selected Products */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Seçilen Ürünler ({selectedProducts.length})
          </h3>
          <p className="card-subtitle">
            Toplam {totalQuantity} adet • Birim maliyet: ${unitShippingCost.toFixed(2)}
          </p>
        </div>

        <div className="space-y-3">
          {selectedProducts.map((item) => {
            const isScanned = scannedItems.has(item.product_id);
            const isMissing = missingItems.includes(item.product_id);
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                  isScanned 
                    ? 'bg-green-50 border border-green-200' 
                    : isMissing 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">📦</span>
                    {isScanned && <span className="text-green-600 text-lg">✅</span>}
                    {isMissing && <span className="text-red-600 text-lg">❌</span>}
                    {!isScanned && !isMissing && <span className="text-yellow-600 text-lg">⏳</span>}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.product?.name}</div>
                    <div className="text-xs text-gray-500">
                      ASIN: {item.product?.asin} | SKU: {item.product?.merchant_sku}
                    </div>
                    {item.product?.amazon_barcode && (
                      <div className="text-xs text-gray-400 mt-1">
                        Barkod: {item.product.amazon_barcode}
                      </div>
                    )}
                  </div>
                </div>
              
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${(item.quantity * unitShippingCost).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${unitShippingCost.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onRemoveProduct(item.id)}
                    className="action-btn action-btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
          
          {selectedProducts.length === 0 && (
            <div className="text-center py-8">
              <span className="mx-auto text-6xl text-gray-400">📦</span>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Henüz ürün eklenmedi
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ürün ekle butonuna tıklayarak ürün seçin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedProducts.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Sevkiyat Özeti</h3>
              <p className="text-sm text-blue-700">
                {selectedProducts.length} ürün • {totalQuantity} adet
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                ${totalShippingCost.toFixed(2)}
              </div>
              <div className="text-sm text-blue-700">
                Toplam kargo maliyeti
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

