import React from 'react';
import { Product } from '../../../types';

interface QuantityModalProps {
  isOpen: boolean;
  product: Product | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  product,
  quantity,
  onQuantityChange,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ürün Miktarı
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            <strong>{product.name}</strong> için kaç adet eklemek istiyorsunuz?
          </p>
          
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center text-2xl font-bold border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => onQuantityChange(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-medium"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              className="btn-primary flex-1"
            >
              Ekle ({quantity} adet)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

