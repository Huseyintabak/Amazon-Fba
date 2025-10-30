import React from 'react';
import { Product } from '../../../types';
import ResizableTable from '../../../components/ResizableTable';
import ProductPerformanceAnalyzer from '../../../components/ProductPerformanceAnalyzer';
import PriceOptimizerButton from '../../../components/PriceOptimizerButton';
import ProductLimitBlur from '../../../components/ProductLimitBlur';

interface ProductTableProps {
  products: Product[];
  bulkSelection: {
    isSelected: (id: string) => boolean;
    toggleSelection: (id: string) => void;
    isAllSelected: (items: Product[]) => boolean;
    toggleAll: (items: Product[]) => void;
    selectedCount: number;
  };
  sortField: keyof Product;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  totalItems: number;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  bulkSelection,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  totalItems
}) => {
  const getSortIcon = (field: keyof Product) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
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
                  onClick={() => onSort('name')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>Ürün Adı</span>
                  <span className="text-sm">{getSortIcon('name')}</span>
                </button>
              </th>
              <th className="table-header-cell">
                <button
                  onClick={() => onSort('category')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>Kategori</span>
                  <span className="text-sm">{getSortIcon('category')}</span>
                </button>
              </th>
              <th className="table-header-cell" style={{ minWidth: '100px', maxWidth: '100px' }}>
                <button
                  onClick={() => onSort('asin')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>ASIN</span>
                  <span className="text-sm">{getSortIcon('asin')}</span>
                </button>
              </th>
              <th className="table-header-cell" style={{ minWidth: '120px', maxWidth: '120px' }}>
                <button
                  onClick={() => onSort('merchant_sku')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>Merchant SKU</span>
                  <span className="text-sm">{getSortIcon('merchant_sku')}</span>
                </button>
              </th>
              <th className="table-header-cell" style={{ minWidth: '180px', maxWidth: '180px' }}>
                <button
                  onClick={() => onSort('supplier_name')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>Tedarikçi</span>
                  <span className="text-sm">{getSortIcon('supplier_name')}</span>
                </button>
              </th>
              <th className="table-header-cell">
                <button
                  onClick={() => onSort('product_cost')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>Maliyet</span>
                  <span className="text-sm">{getSortIcon('product_cost')}</span>
                </button>
              </th>
              <th className="table-header-cell">
                <button
                  onClick={() => onSort('estimated_profit')}
                  className="flex items-center space-x-1 w-full"
                >
                  <span>Kar</span>
                  <span className="text-sm">{getSortIcon('estimated_profit')}</span>
                </button>
              </th>
              <th className="table-header-cell" style={{ minWidth: '120px', maxWidth: '120px' }}>İşlemler</th>
            </tr>
          </thead>
          <tbody className="table-body">
            <ProductLimitBlur currentCount={totalItems} limit={10}>
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
                          onClick={() => onEdit(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => onDelete(product)}
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
  );
};

