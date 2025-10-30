import React from 'react';
import { Product } from '../../../types';

interface ProductHeaderProps {
  totalCount: number;
  onAdd: () => void;
  onImport: () => void;
  onManageCategories: () => void;
  isFreeUser: boolean;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  totalCount,
  onAdd,
  onImport,
  onManageCategories,
  isFreeUser
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📦 Ürün Yönetimi</h1>
        <p className="mt-2 text-sm text-gray-600">
          Ürünlerinizi görüntüleyin, ekleyin, düzenleyin ve silin
        </p>
      </div>
      <div className="mt-4 sm:mt-0 flex space-x-3">
        <button
          onClick={onManageCategories}
          className="btn-secondary flex items-center space-x-2"
        >
          <span>🏷️</span>
          <span>Kategori Yönetimi</span>
        </button>
        <button
          onClick={onAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Yeni Ürün Ekle</span>
        </button>
        <button
          onClick={onImport}
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
  );
};

