import React, { useState } from 'react';
import { Product } from '../types';

interface ProductPerformanceAnalyzerProps {
  product: Product;
}

const ProductPerformanceAnalyzer: React.FC<ProductPerformanceAnalyzerProps> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);

  const performanceScore = product.roi_percentage ? 
    Math.min(Math.max(product.roi_percentage / 20, 0), 5) : 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        title="Performans Analizi"
      >
        📊 Analiz
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Ürün Performans Analizi</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                <p className="text-sm text-gray-600">ASIN: {product.asin || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">💰 Finansal Performans</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Maliyet:</span>
                      <span className="font-semibold">
                        {product.product_cost ? `$${product.product_cost.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tahmini Kar:</span>
                      <span className={`font-semibold ${product.estimated_profit && product.estimated_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.estimated_profit ? `$${product.estimated_profit.toFixed(2)}` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">ROI:</span>
                      <span className={`font-semibold ${product.roi_percentage && product.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.roi_percentage ? `${product.roi_percentage.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">📈 Performans Skoru</h5>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(performanceScore / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {performanceScore.toFixed(1)}/5
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {performanceScore >= 4 ? 'Mükemmel' : 
                     performanceScore >= 3 ? 'İyi' : 
                     performanceScore >= 2 ? 'Orta' : 
                     performanceScore >= 1 ? 'Düşük' : 'Çok Düşük'}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-2">🏭 Tedarikçi Bilgileri</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tedarikçi:</span>
                    <span className="font-semibold">{product.supplier_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ülke:</span>
                    <span className="font-semibold">{product.supplier_country || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Öneriler</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  {product.roi_percentage && product.roi_percentage < 20 && (
                    <li>• ROI oranınız düşük. Maliyet optimizasyonu düşünün.</li>
                  )}
                  {product.estimated_profit && product.estimated_profit < 0 && (
                    <li>• Negatif kar durumu. Fiyat stratejinizi gözden geçirin.</li>
                  )}
                  {(!product.product_cost || product.product_cost === 0) && (
                    <li>• Ürün maliyeti girilmemiş. Doğru ROI hesaplaması için gerekli.</li>
                  )}
                  {product.roi_percentage && product.roi_percentage > 50 && (
                    <li>• Mükemmel ROI! Bu ürünü daha fazla stoklamayı düşünün.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsOpen(false)}
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

export default ProductPerformanceAnalyzer;