import React, { useState } from 'react';
import { logger } from '../lib/logger';
import { Product, PriceRecommendation } from '../types';

interface AIPriceOptimizationProps {
  products: Product[];
  onUpdatePrice?: (productId: string, newPrice: number) => void;
}

const AIPriceOptimization: React.FC<AIPriceOptimizationProps> = ({
  products,
  onUpdatePrice
}) => {
  const [recommendations, setRecommendations] = useState<PriceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');

  const strategies = [
    { value: 'all', label: 'Tüm Stratejiler', icon: '🎯' },
    { value: 'aggressive', label: 'Agresif Fiyatlandırma', icon: '⚡' },
    { value: 'competitive', label: 'Rekabetçi Fiyatlandırma', icon: '⚖️' },
    { value: 'premium', label: 'Premium Fiyatlandırma', icon: '💎' },
    { value: 'volume', label: 'Hacim Odaklı', icon: '📈' }
  ];

  const generatePriceRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.log('Starting price optimization...');
      
      // Use secure backend API instead of direct OpenAI call
      const { analyzePriceOptimization } = await import('../lib/aiApi');

      // Ürün verilerini hazırla
      const productData = products
        .filter(p => p.product_cost && p.estimated_profit !== undefined)
        .map(product => ({
          id: product.id,
          name: product.name,
          category: product.category || 'unknown',
          cost: product.product_cost || 0,
          currentPrice: (product.product_cost || 0) + (product.estimated_profit || 0),
          profit: product.estimated_profit || 0,
          roi: product.roi_percentage || 0,
          sales: product.units_sold || 0,
          revenue: product.revenue_generated || 0
        }));

      logger.log('Product data prepared:', productData.length, 'products');

      // Use secure backend API
      const strategy = selectedStrategy === 'all' ? 'Tüm stratejiler' : strategies.find(s => s.value === selectedStrategy)?.label || 'Tüm stratejiler';
      
      logger.log('Calling analyzePriceOptimization with strategy:', strategy);
      const response = await analyzePriceOptimization(productData, strategy);
      
      logger.log('Response received:', response.success);
      
      if (!response.success) {
        throw new Error(response.error || 'Fiyat optimizasyonu başarısız');
      }
      
      // Handle response data
      const result = response.data;
      logger.log('Setting recommendations:', result.recommendations?.length || 0);
      setRecommendations(result.recommendations || []);
    } catch (err: unknown) {
      logger.error('AI Price Optimization error:', err);
      setError('Fiyat optimizasyonu yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'premium': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'competitive': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'budget': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getMarketPositionLabel = (position: string) => {
    switch (position) {
      case 'premium': return 'Premium';
      case 'competitive': return 'Rekabetçi';
      case 'budget': return 'Ekonomik';
      default: return 'Bilinmiyor';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return 'Düşük';
      case 'medium': return 'Orta';
      case 'high': return 'Yüksek';
      default: return 'Bilinmiyor';
    }
  };

  const handleApplyPrice = (recommendation: PriceRecommendation) => {
    if (onUpdatePrice && recommendation.productId) {
      onUpdatePrice(recommendation.productId, recommendation.recommendedPrice);
    }
  };

  const filteredRecommendations = selectedStrategy === 'all' 
    ? recommendations 
    : recommendations.filter(rec => {
        // Stratejiye göre filtreleme (basit implementasyon)
        if (selectedStrategy === 'aggressive') return (rec.priceChangePercent || 0) > 20;
        if (selectedStrategy === 'competitive') return (rec.priceChangePercent || 0) >= -10 && (rec.priceChangePercent || 0) <= 20;
        if (selectedStrategy === 'premium') return rec.marketPosition === 'premium';
        if (selectedStrategy === 'volume') return (rec.expectedSalesIncrease || 0) > 20;
        return true;
      });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <span>💰</span>
              <span>AI Fiyat Optimizasyonu</span>
            </h3>
            <p className="text-gray-600">
              Ürünlerinizin fiyatlarını AI ile optimize edin ve karı maksimize edin
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {strategies.map(strategy => (
                <option key={strategy.value} value={strategy.value}>
                  {strategy.icon} {strategy.label}
                </option>
              ))}
            </select>
            <button
              onClick={generatePriceRecommendations}
              disabled={isLoading || products.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? '🔄 Analiz Ediliyor...' : '🚀 Fiyat Analizi Başlat'}
            </button>
          </div>
        </div>
      </div>

      <div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Kapat
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">AI fiyat optimizasyonu yapıyor...</p>
            <p className="text-sm text-gray-500 mt-2">
              Ürünlerinizi analiz ediyor ve optimal fiyatları hesaplıyor
            </p>
          </div>
        )}

        {!isLoading && recommendations.length === 0 && !error && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">💰</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              AI Fiyat Optimizasyonu
            </h4>
            <p className="text-gray-600 mb-6">
              Ürünlerinizin fiyatlarını analiz ederek kar maksimizasyonu önerileri alın
            </p>
            <button
              onClick={generatePriceRecommendations}
              disabled={products.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Fiyat Analizi Başlat
            </button>
            {products.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Önce ürün eklemeniz gerekiyor
              </p>
            )}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                💡 Fiyat Önerileri ({filteredRecommendations.length})
              </h4>
              <button
                onClick={generatePriceRecommendations}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                🔄 Yenile
              </button>
            </div>

            <div className="space-y-6">
              {filteredRecommendations.map((rec, idx) => {
                const priceChange = (rec.recommendedPrice || 0) - (rec.currentPrice || 0);
                const priceChangePercent = rec.currentPrice ? (priceChange / rec.currentPrice) * 100 : 0;
                
                return (
                <div key={rec.productId || idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-gray-900 mb-2">{rec.productName}</h5>
                      <div className="flex items-center space-x-4">
                        {rec.confidence && (
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-blue-600">
                              {rec.confidence}%
                            </span>
                            <span className="text-sm text-gray-500">Güven Skoru</span>
                          </div>
                        )}
                        {rec.marketPosition && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMarketPositionColor(rec.marketPosition)}`}>
                            {getMarketPositionLabel(rec.marketPosition)}
                          </span>
                        )}
                        {rec.riskLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskLevel)}`}>
                            Risk: {rec.riskLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Mevcut Fiyat</p>
                      <p className="text-xl font-bold text-gray-900">${(rec.currentPrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Önerilen Fiyat</p>
                      <p className="text-xl font-bold text-blue-600">${(rec.recommendedPrice || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Fiyat Değişimi</p>
                      <p className={`text-lg font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{rec.estimatedRevenueIncrease ? 'Beklenen Gelir Artışı' : 'Etki'}</p>
                      <p className="text-lg font-bold text-green-600">
                        {rec.estimatedRevenueIncrease ? `+$${(rec.estimatedRevenueIncrease || 0).toFixed(2)}` : rec.expectedImpact || 'Medium'}
                      </p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {rec.rationale && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h6 className="font-semibold text-gray-900 mb-2">💡 Gerekçe:</h6>
                      <p className="text-sm text-gray-700">{rec.rationale}</p>
                    </div>
                  )}

                  {/* Risk Assessment */}
                  {rec.riskAssessment && (
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-900 mb-2">⚠️ Risk Değerlendirmesi:</h6>
                      <div className="flex space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskAssessment.salesRisk)}`}>
                          Satış Riski: {getRiskLabel(rec.riskAssessment.salesRisk)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskAssessment.profitRisk)}`}>
                          Kar Riski: {getRiskLabel(rec.riskAssessment.profitRisk)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskAssessment.marketRisk)}`}>
                          Pazar Riski: {getRiskLabel(rec.riskAssessment.marketRisk)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Implementation Strategy */}
                  {rec.implementation && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h6 className="font-semibold text-blue-700 mb-2">🎯 Uygulama Stratejisi:</h6>
                        <p className="text-sm text-blue-800 mb-2">{rec.implementation.strategy}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Zaman Çizelgesi: <span className="font-semibold">{rec.implementation.timeline}</span></span>
                          <span className="text-blue-600">Beklenen Satış Artışı: <span className="font-semibold">+%{rec.expectedSalesIncrease || 0}</span></span>
                        </div>
                      </div>

                      {/* Monitoring Metrics */}
                      {rec.implementation.monitoring && rec.implementation.monitoring.length > 0 && (
                        <div className="mb-4">
                          <h6 className="font-semibold text-gray-900 mb-2">📊 İzleme Metrikleri:</h6>
                          <div className="flex flex-wrap gap-2">
                            {rec.implementation.monitoring.map((metric, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {metric}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Button */}
                  {onUpdatePrice && (
                    <button
                      onClick={() => handleApplyPrice(rec)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      💰 Fiyatı Güncelle (${(rec.recommendedPrice || 0).toFixed(2)})
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPriceOptimization;

