import React from 'react';
import type { Product } from '@/types';

interface BarcodeScannerProps {
  barcodeMode: boolean;
  barcodeInput: string;
  boxPreparationMode: boolean;
  scannedItems: Set<string>;
  missingItems: string[];
  showDoubleCheck: boolean;
  selectedProductsCount: number;
  products: Product[];
  onToggleBarcodeMode: () => void;
  onToggleBoxPreparationMode: () => void;
  onBarcodeInputChange: (value: string) => void;
  onBarcodeScan: (barcode: string) => void;
  onDoubleCheck: () => void;
  onApproveShipment: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  barcodeMode,
  barcodeInput,
  boxPreparationMode,
  scannedItems,
  missingItems,
  showDoubleCheck,
  selectedProductsCount,
  onToggleBarcodeMode,
  onToggleBoxPreparationMode,
  onBarcodeInputChange,
  onBarcodeScan,
  onDoubleCheck,
  onApproveShipment
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Barkod Okuyucu</h3>
      </div>
      
      <div className="space-y-4">
        {/* Normal Barcode Mode */}
        <button
          onClick={onToggleBarcodeMode}
          className={`w-full btn-${barcodeMode ? 'success' : 'secondary'} flex items-center justify-center space-x-2`}
        >
          <span>📱</span>
          <span>{barcodeMode ? 'Barkod Modu Aktif' : 'Barkod Modunu Aç'}</span>
        </button>
        
        {barcodeMode && (
          <div className="space-y-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => onBarcodeInputChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onBarcodeScan(barcodeInput);
                }
              }}
              className="input-field"
              placeholder="Barkodu okutun veya yazın..."
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Barkodu okutun ve Enter'a basın
            </p>
          </div>
        )}

        {/* Box Preparation Mode */}
        {selectedProductsCount > 0 && (
          <div className="border-t pt-4">
            <button
              onClick={onToggleBoxPreparationMode}
              className={`w-full btn-${boxPreparationMode ? 'warning' : 'secondary'} flex items-center justify-center space-x-2`}
            >
              <span>📦</span>
              <span>{boxPreparationMode ? 'Kutu Hazırlama Modu Aktif' : 'Kutu Hazırlama Modunu Aç'}</span>
            </button>
            
            {boxPreparationMode && (
              <div className="space-y-3 mt-4">
                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${selectedProductsCount > 0 ? (scannedItems.size / selectedProductsCount) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  {scannedItems.size} / {selectedProductsCount} ürün okundu
                </div>

                {/* Double Check Button */}
                {scannedItems.size > 0 && (
                  <button
                    onClick={onDoubleCheck}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Kontrol Et</span>
                  </button>
                )}

                {/* Missing Items Alert */}
                {showDoubleCheck && missingItems.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-red-800">
                      <span>⚠️</span>
                      <span className="font-medium">Eksik Ürünler:</span>
                    </div>
                    <div className="mt-2 text-sm text-red-700">
                      {missingItems.join(', ')}
                    </div>
                  </div>
                )}

                {/* Approve Button */}
                {showDoubleCheck && missingItems.length === 0 && (
                  <button
                    onClick={onApproveShipment}
                    className="w-full btn-success flex items-center justify-center space-x-2"
                  >
                    <span>✅</span>
                    <span>Sevkiyatı Onayla</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

