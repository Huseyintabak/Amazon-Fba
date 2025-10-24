import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';

interface BulkOperationsProps {
  selectedCount: number;
  selectedItems: Set<string>;
  allItems: Product[];
  onBulkEdit: (updates: Partial<Product>) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedCount,
  selectedItems,
  allItems,
  onBulkEdit,
  onBulkDelete,
  onClearSelection,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  const selectedProducts = allItems.filter(p => selectedItems.has(p.id));

  return (
    <>
      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
        <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-4 flex items-center space-x-4">
          {/* Selected Count */}
          <div className="flex items-center space-x-2 px-4 border-r border-gray-300">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{selectedCount}</span>
            </div>
            <span className="font-medium text-gray-700">
              {selectedCount === 1 ? 'ürün seçildi' : 'ürün seçildi'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:shadow-lg"
            >
              <span>✏️</span>
              <span>Toplu Düzenle</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 hover:shadow-lg"
            >
              <span>🗑️</span>
              <span>Toplu Sil</span>
            </button>

            <button
              onClick={onClearSelection}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
            >
              ❌ İptal
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Edit Modal */}
      {showEditModal && (
        <BulkEditModal
          selectedProducts={selectedProducts}
          onClose={() => setShowEditModal(false)}
          onConfirm={(updates) => {
            onBulkEdit(updates);
            setShowEditModal(false);
            onClearSelection();
          }}
        />
      )}

      {/* Bulk Delete Confirm */}
      {showDeleteConfirm && (
        <BulkDeleteModal
          selectedCount={selectedCount}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            onBulkDelete();
            setShowDeleteConfirm(false);
            onClearSelection();
          }}
        />
      )}
    </>
  );
};

// Bulk Edit Modal Component
interface BulkEditModalProps {
  selectedProducts: Product[];
  onClose: () => void;
  onConfirm: (updates: Partial<Product>) => void;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({ selectedProducts, onClose, onConfirm }) => {
  const [updates, setUpdates] = useState<Partial<Product>>({});
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Set<string>>(new Set());
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Load suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name, company_name, country')
          .order('name');
        
        if (error) throw error;
        setSuppliers(data || []);
      } catch (error: any) {
        console.error('Tedarikçiler yüklenemedi:', error.message);
      }
    };

    loadSuppliers();
  }, []);

  const toggleField = (field: string) => {
    setFieldsToUpdate(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
        // Remove from updates
        const newUpdates = { ...updates };
        delete newUpdates[field as keyof Product];
        setUpdates(newUpdates);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fieldsToUpdate.size === 0) {
      alert('Lütfen en az bir alan seçin!');
      return;
    }
    onConfirm(updates);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            ✏️ Toplu Düzenleme ({selectedProducts.length} ürün)
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ❌
          </button>
        </div>

        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Bilgi:</strong> Seçili alanlar {selectedProducts.length} ürün için güncellenecek. 
            İşaretli alanlar değiştirilecek, işaretsiz alanlar korunacak.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amazon Barcode */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('amazon_barcode')}
                onChange={() => toggleField('amazon_barcode')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Amazon Barkod</span>
            </label>
            {fieldsToUpdate.has('amazon_barcode') && (
              <input
                type="text"
                value={updates.amazon_barcode || ''}
                onChange={(e) => setUpdates({ ...updates, amazon_barcode: e.target.value })}
                className="input-field"
                placeholder="B08QCQYPFX"
              />
            )}
          </div>

          {/* Supplier */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('supplier_id')}
                onChange={() => toggleField('supplier_id')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Tedarikçi</span>
            </label>
            {fieldsToUpdate.has('supplier_id') && (
              <select
                value={updates.supplier_id || ''}
                onChange={(e) => setUpdates({ ...updates, supplier_id: e.target.value })}
                className="input-field"
              >
                <option value="">Tedarikçi seçin</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} {supplier.company_name && `(${supplier.company_name})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Manufacturer Code */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('manufacturer_code')}
                onChange={() => toggleField('manufacturer_code')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Üretici Kodu</span>
            </label>
            {fieldsToUpdate.has('manufacturer_code') && (
              <input
                type="text"
                value={updates.manufacturer_code || ''}
                onChange={(e) => setUpdates({ ...updates, manufacturer_code: e.target.value })}
                className="input-field"
                placeholder="MFG-123"
              />
            )}
          </div>

          {/* Product Cost */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('product_cost')}
                onChange={() => toggleField('product_cost')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Ürün Maliyeti ($)</span>
            </label>
            {fieldsToUpdate.has('product_cost') && (
              <input
                type="number"
                step="0.01"
                min="0"
                value={updates.product_cost || ''}
                onChange={(e) => setUpdates({ ...updates, product_cost: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            )}
          </div>

          {/* Amazon Price */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('amazon_price')}
                onChange={() => toggleField('amazon_price')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Amazon Satış Fiyatı ($)</span>
            </label>
            {fieldsToUpdate.has('amazon_price') && (
              <input
                type="number"
                step="0.01"
                min="0"
                value={updates.amazon_price || ''}
                onChange={(e) => setUpdates({ ...updates, amazon_price: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            )}
          </div>

          {/* Referral Fee */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('referral_fee_percent')}
                onChange={() => toggleField('referral_fee_percent')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Referral Fee (%)</span>
            </label>
            {fieldsToUpdate.has('referral_fee_percent') && (
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={updates.referral_fee_percent || ''}
                onChange={(e) => setUpdates({ ...updates, referral_fee_percent: parseFloat(e.target.value) || 15 })}
                className="input-field"
                placeholder="15"
              />
            )}
          </div>

          {/* Fulfillment Fee */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('fulfillment_fee')}
                onChange={() => toggleField('fulfillment_fee')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">FBA Fulfillment Fee ($)</span>
            </label>
            {fieldsToUpdate.has('fulfillment_fee') && (
              <input
                type="number"
                step="0.01"
                min="0"
                value={updates.fulfillment_fee || ''}
                onChange={(e) => setUpdates({ ...updates, fulfillment_fee: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            )}
          </div>

          {/* Advertising Cost */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('advertising_cost')}
                onChange={() => toggleField('advertising_cost')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Reklam Maliyeti (PPC) ($)</span>
            </label>
            {fieldsToUpdate.has('advertising_cost') && (
              <input
                type="number"
                step="0.01"
                min="0"
                value={updates.advertising_cost || ''}
                onChange={(e) => setUpdates({ ...updates, advertising_cost: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            )}
          </div>

          {/* Initial Investment */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('initial_investment')}
                onChange={() => toggleField('initial_investment')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">İlk Yatırım ($)</span>
            </label>
            {fieldsToUpdate.has('initial_investment') && (
              <input
                type="number"
                step="0.01"
                min="0"
                value={updates.initial_investment || ''}
                onChange={(e) => setUpdates({ ...updates, initial_investment: parseFloat(e.target.value) || 0 })}
                className="input-field"
                placeholder="0.00"
              />
            )}
          </div>

          {/* Notes */}
          <div className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
            <label className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                checked={fieldsToUpdate.has('notes')}
                onChange={() => toggleField('notes')}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium text-gray-900">Notlar</span>
            </label>
            {fieldsToUpdate.has('notes') && (
              <textarea
                value={updates.notes || ''}
                onChange={(e) => setUpdates({ ...updates, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Ürün hakkında notlar..."
              />
            )}
          </div>

          {/* Summary */}
          {fieldsToUpdate.size > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">📋 Güncelleme Özeti</h4>
              <p className="text-sm text-green-800">
                <strong>{fieldsToUpdate.size}</strong> alan, <strong>{selectedProducts.length}</strong> üründe güncellenecek.
              </p>
              <ul className="text-sm text-green-700 mt-2 list-disc list-inside">
                {Array.from(fieldsToUpdate).map(field => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="btn-secondary">
              İptal
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={fieldsToUpdate.size === 0}
            >
              {selectedProducts.length} Ürünü Güncelle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Delete Modal Component
interface BulkDeleteModalProps {
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({ selectedCount, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const requiredText = 'SİL';

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-600">
            ⚠️ Toplu Silme Onayı
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ❌
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-semibold mb-2">
              ⛔ DİKKAT: Bu işlem geri alınamaz!
            </p>
            <p className="text-red-700 text-sm">
              <strong>{selectedCount}</strong> ürün kalıcı olarak silinecek. 
              Bu ürünlere ait tüm veriler kaybolacak.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devam etmek için "<strong>{requiredText}</strong>" yazın:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input-field text-center font-bold"
              placeholder={requiredText}
              autoFocus
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary">
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== requiredText}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedCount} Ürünü Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;

