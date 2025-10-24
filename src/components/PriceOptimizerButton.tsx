import React, { useState } from 'react';
import { Product } from '../types';

interface PriceOptimizerButtonProps {
  product: Product;
}

const PriceOptimizerButton: React.FC<PriceOptimizerButtonProps> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [optimizedPrice, setOptimizedPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateOptimalPrice = () => {
    if (!product.product_cost) return;
    
    setIsCalculating(true);
    
    // Simulate AI calculation
    setTimeout(() => {
      const baseCost = product.product_cost;
      const targetROI = 30; // 30% target ROI
      const amazonFees = 0.15; // 15% Amazon fees
      const shippingCost = 2.50; // Estimated shipping
      const advertisingCost = baseCost * 0.1; // 10% of cost for ads
      
      const totalCosts = baseCost + shippingCost + advertisingCost;
      const optimalPrice = totalCosts * (1 + targetROI / 100) / (1 - amazonFees);
      
      setOptimizedPrice(Math.round(optimalPrice * 100) / 100);
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-green-600 hover:text-green-800 font-medium"
        title="Fiyat Optimizasyonu"
      >
        💰 Optimize
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Fiyat Optimizasyonu</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                <p className="text-sm text-gray-600">Mevcut Maliyet: {product.product_cost ? `$${product.product_cost.toFixed(2)}` : 'N/A'}</p>
              </div>

              {!product.product_cost ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-yellow-800">
                      Fiyat optimizasyonu için ürün maliyeti gereklidir. Lütfen önce ürün maliyetini girin.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">🎯 Optimizasyon Parametreleri</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hedef ROI:</span>
                        <span className="font-semibold">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amazon Komisyonu:</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sevkiyat Maliyeti:</span>
                        <span className="font-semibold">$2.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reklam Bütçesi:</span>
                        <span className="font-semibold">10%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={calculateOptimalPrice}
                      disabled={isCalculating}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCalculating ? 'Hesaplanıyor...' : '🎯 Optimal Fiyatı Hesapla'}
                    </button>
                  </div>

                  {optimizedPrice && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-900 mb-2">✅ Optimal Fiyat</h5>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          ${optimizedPrice.toFixed(2)}
                        </div>
                        <p className="text-sm text-green-700">
                          Bu fiyatla %30 ROI hedeflenmektedir
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-900 mb-2">💡 Fiyat Stratejisi Önerileri</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Rekabet analizi yaparak market fiyatını kontrol edin</li>
                      <li>• Amazon'un dinamik fiyatlandırma önerilerini takip edin</li>
                      <li>• Sezonsal dalgalanmaları göz önünde bulundurun</li>
                      <li>• Promosyon kampanyaları için esnek fiyat aralıkları belirleyin</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setOptimizedPrice(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PriceOptimizerButton;