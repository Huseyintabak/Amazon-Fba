import React, { useRef, useState } from 'react';
import { Product } from '../../../types';
import { processCSVFile, getCSVTemplate } from '../../../lib/csvImport';
import { exportProductsForUpdate } from '../../../lib/csvExport';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, updateMode: boolean) => Promise<void>;
  onExport: () => void;
  products: Product[];
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onExport,
  products
}) => {
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const importMode = (document.querySelector('input[name="importMode"]:checked') as HTMLInputElement)?.value === 'update';
      await onImport(file, importMode);
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
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

  const handleClose = () => {
    setImportResults(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">CSV İçe Aktar</h3>
        
        <div className="space-y-4">
          {/* Import Mode Selection */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">📋 İşlem Modu</h4>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="create"
                  defaultChecked
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Yeni Ürün Ekle</div>
                  <div className="text-sm text-gray-600">CSV'deki ürünleri yeni olarak ekler</div>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="update"
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Mevcut Ürünleri Güncelle</div>
                  <div className="text-sm text-gray-600">ASIN/SKU ile eşleşen ürünleri günceller</div>
                  <div className="text-xs text-orange-600 mt-1">
                    💡 Önce "Mevcut Ürünleri Export Et" ile CSV indirin, düzenleyin, sonra import edin
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* CSV Format Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📋 CSV Formatı</h4>
            <p className="text-sm text-blue-700 mb-2">
              CSV dosyanızda şu sütunlar bulunmalıdır:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Temel Alanlar:</h5>
                <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
                  <li>Ürün Adı - Zorunlu</li>
                  <li>ASIN - Opsiyonel</li>
                  <li>Merchant SKU - Opsiyonel</li>
                  <li>Ürün Maliyeti - Opsiyonel</li>
                  <li>Amazon Barkod - Opsiyonel</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-purple-800 mb-2">🔒 Premium Alanlar:</h5>
                <ul className="text-xs text-purple-600 list-disc list-inside space-y-1">
                  <li>Amazon Fiyatı ($)</li>
                  <li>Referans Ücreti (%)</li>
                  <li>Fulfillment Ücreti ($)</li>
                  <li>Reklam Maliyeti ($)</li>
                  <li>İlk Yatırım ($)</li>
                  <li>Tedarikçi Adı</li>
                  <li>Tedarikçi Ülkesi</li>
                  <li>Notlar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <input
              ref={csvFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => csvFileInputRef.current?.click()}
              disabled={isImporting}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <span>📁</span>
              <span>{isImporting ? 'İşleniyor...' : 'Dosya Seç'}</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="btn-secondary flex items-center space-x-2"
            >
              <span>📥</span>
              <span>Template İndir</span>
            </button>
            <button
              onClick={onExport}
              className="btn-primary flex items-center space-x-2"
            >
              <span>📤</span>
              <span>Mevcut Ürünleri Export Et</span>
            </button>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-1">✅ Başarılı</h4>
                  <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-1">❌ Başarısız</h4>
                  <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                </div>
              </div>

              {importResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Hata Detayları</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
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
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;

