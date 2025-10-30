import React from 'react';
import { Product } from '../../../types';

interface DeleteConfirmationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ürünü Sil</h3>
        <p className="text-gray-600 mb-6">
          "{product.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
