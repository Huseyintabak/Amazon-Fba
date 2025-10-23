import React, { useState } from 'react';
import { optimizePrice, PriceOptimization } from '../lib/gemini';
import { Product } from '../types';

interface PriceOptimizerButtonProps {
  product: Product;
  onPriceUpdate?: (newPrice: number) => void;
}

const PriceOptimizerButton: React.FC<PriceOptimizerButtonProps> = ({ product, onPriceUpdate }) => {
  const [optimization, setOptimization] = useState<PriceOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const optimize = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsOpen(true);

      const result = await optimizePrice({
        name: product.name,
        product_cost: product.product_cost,
        amazon_price: product.amazon_price,
        estimated_profit: product.estimated_profit,
        profit_margin: product.profit_margin,
        units_sold: product.units_sold
      });

      setOptimization(result);
    } catch (err) {
      console.error('Price optimization error:', err);
      setError('Fiyat optimizasyonu yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceChange = () => {
    if (!optimization) return 0;
    return optimization.suggestedPrice - optimization.currentPrice;
  };

  const getPriceChangePercent = () => {
    if (!optimization || optimization.currentPrice === 0) return 0;
    return ((getPriceChange() / optimization.currentPrice) * 100).toFixed(1);
  };

  const handleApplyPrice = () => {
    if (optimization && onPriceUpdate) {
      onPriceUpdate(optimization.suggestedPrice);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={optimize}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI Fiyat Önerisi"
      >
        <span className="mr-1">💰</span>
        <span>{isLoading ? 'Hesaplanıyor...' : 'Fiyat Öner'}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">💰</span>
                  <div>
                    <h3 className="text-xl font-bold">AI Fiyat Optimizasyonu</h3>
                    <p className="text-sm text-green-100 mt-1">{product.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  <p className="mt-4 text-gray-600">Optimal fiyat hesaplanıyor...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <span className="text-4xl block mb-3">⚠️</span>
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={optimize}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}

              {!isLoading && !error && optimization && (
                <div className="space-y-6">
                  {/* Price Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Mevcut Fiyat</div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${optimization.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="text-sm text-green-600 mb-1">Önerilen Fiyat</div>
                      <div className="text-2xl font-bold text-green-700">
                        ${optimization.suggestedPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Price Change */}
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Fiyat Değişimi</div>
                    <div className="text-xl font-bold text-blue-700">
                      {getPriceChange() > 0 ? '+' : ''}${getPriceChange().toFixed(2)} 
                      <span className="text-sm ml-2">
                        ({getPriceChange() > 0 ? '+' : ''}{getPriceChangePercent()}%)
                      </span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Açıklama</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{optimization.reasoning}</p>
                    </div>
                  </div>

                  {/* Expected Impact */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Beklenen Etki</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">Kar Değişimi:</span>
                        <span className="text-sm font-semibold text-green-700">
                          {optimization.expectedImpact.profitChange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">Talep Etkisi:</span>
                        <span className="text-sm font-semibold text-blue-700">
                          {optimization.expectedImpact.demandChange}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      💡 Bu öneri AI analizi sonucudur. Nihai kararı siz vermelisiniz.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {!isLoading && optimization && (
              <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={optimize}
                    className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    🔄 Yeniden Hesapla
                  </button>
                  {onPriceUpdate && (
                    <button
                      onClick={handleApplyPrice}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Fiyatı Uygula
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PriceOptimizerButton;

