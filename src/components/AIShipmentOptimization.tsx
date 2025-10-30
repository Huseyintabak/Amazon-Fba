import React, { useState } from 'react';
import { Product, Shipment } from '../types';

interface OptimizationRecommendation {
  id: string;
  type: 'carrier' | 'timing' | 'packaging' | 'route' | 'cost';
  title: string;
  description: string;
  currentValue: string | number;
  recommendedValue: string | number;
  savings: number;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
  timeline: string;
  risk: 'low' | 'medium' | 'high';
}

interface ShipmentOptimization {
  totalSavings: number;
  recommendations: OptimizationRecommendation[];
  priority: {
    high: OptimizationRecommendation[];
    medium: OptimizationRecommendation[];
    low: OptimizationRecommendation[];
  };
  summary: {
    costReduction: number;
    timeReduction: number;
    efficiencyGain: number;
  };
}

interface AIShipmentOptimizationProps {
  shipments: Shipment[];
  products: Product[];
}

const AIShipmentOptimization: React.FC<AIShipmentOptimizationProps> = ({
  shipments,
  products
}) => {
  const [optimization, setOptimization] = useState<ShipmentOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const generateOptimization = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use secure backend API instead of direct OpenAI call
      const { optimizeShipments } = await import('../lib/aiApi');

      // Sevkiyat verilerini hazırla
      const shipmentData = shipments.map(shipment => {
        const shipmentProducts = products.filter(p => 
          // Bu kısım gerçek uygulamada shipment_items tablosundan gelecek
          shipment.id // Placeholder
        );
        
        return {
          id: shipment.id,
          fbaId: shipment.fba_shipment_id,
          date: shipment.shipment_date,
          carrier: shipment.carrier_company,
          cost: shipment.total_shipping_cost,
          status: shipment.status,
          notes: shipment.notes,
          productCount: shipmentProducts.length,
          totalWeight: shipmentProducts.reduce((sum, p) => sum + (p.weight || 0), 0),
          totalValue: shipmentProducts.reduce((sum, p) => sum + (p.product_cost || 0), 0)
        };
      });

      // Use secure backend API
      const response = await optimizeShipments(shipmentData);
      
      if (!response.success) {
        throw new Error(response.error || 'Sevkiyat optimizasyonu başarısız');
      }
      
      const result = response.data;
      
      // Önerileri öncelik seviyesine göre grupla
      const highPriority = result.recommendations?.filter((r: OptimizationRecommendation) => r.impact === 'high') || [];
      const mediumPriority = result.recommendations?.filter((r: OptimizationRecommendation) => r.impact === 'medium') || [];
      const lowPriority = result.recommendations?.filter((r: OptimizationRecommendation) => r.impact === 'low') || [];

      setOptimization({
        ...result,
        priority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority
        }
      });
    } catch (err: unknown) {
      console.error('AI Shipment Optimization error:', err);
      setError('Sevkiyat optimizasyonu yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'carrier': return '🚚';
      case 'timing': return '⏰';
      case 'packaging': return '📦';
      case 'route': return '🗺️';
      case 'cost': return '💰';
      default: return '💡';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'carrier': return 'Kargo Firması';
      case 'timing': return 'Zamanlama';
      case 'packaging': return 'Paketleme';
      case 'route': return 'Rota';
      case 'cost': return 'Maliyet';
      default: return 'Genel';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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

  const filteredRecommendations = selectedPriority === 'all' 
    ? optimization?.recommendations || []
    : optimization?.priority[selectedPriority] || [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <span>🚚</span>
              <span>AI Sevkiyat Optimizasyonu</span>
            </h3>
            <p className="text-gray-600">
              Sevkiyat sürecinizi AI ile optimize edin ve maliyetleri düşürün
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {optimization && (
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Öneriler</option>
                <option value="high">Yüksek Öncelik</option>
                <option value="medium">Orta Öncelik</option>
                <option value="low">Düşük Öncelik</option>
              </select>
            )}
            <button
              onClick={generateOptimization}
              disabled={isLoading || shipments.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? '🔄 Analiz Ediliyor...' : '🚀 Optimizasyonu Başlat'}
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
            <p className="text-gray-600">AI sevkiyat optimizasyonu yapıyor...</p>
            <p className="text-sm text-gray-500 mt-2">
              Mevcut sevkiyatlarınızı analiz ediyor ve iyileştirme fırsatları arıyor
            </p>
          </div>
        )}

        {!isLoading && !optimization && !error && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">🚚</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              AI Sevkiyat Optimizasyonu
            </h4>
            <p className="text-gray-600 mb-6">
              Sevkiyat sürecinizi analiz ederek maliyet ve verimlilik iyileştirmeleri alın
            </p>
            <button
              onClick={generateOptimization}
              disabled={shipments.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Optimizasyonu Başlat
            </button>
            {shipments.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Önce sevkiyat eklemeniz gerekiyor
              </p>
            )}
          </div>
        )}

        {optimization && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ${(optimization.totalSavings || 0).toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Toplam Tasarruf</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  %{optimization.summary?.costReduction || 0}
                </div>
                <div className="text-sm text-blue-700">Maliyet Azalması</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  %{optimization.summary?.timeReduction || 0}
                </div>
                <div className="text-sm text-purple-700">Zaman Azalması</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  %{optimization.summary?.efficiencyGain || 0}
                </div>
                <div className="text-sm text-orange-700">Verimlilik Artışı</div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  💡 Optimizasyon Önerileri ({filteredRecommendations.length})
                </h4>
                <button
                  onClick={generateOptimization}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  🔄 Yenile
                </button>
              </div>

              <div className="space-y-4">
                {filteredRecommendations.map((rec, idx) => (
                  <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(rec.type)}</span>
                        <div>
                          <h5 className="font-bold text-gray-900">{rec.title}</h5>
                          <p className="text-sm text-gray-500">{getTypeLabel(rec.type)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                          {rec.impact === 'high' ? 'Yüksek Etki' : rec.impact === 'medium' ? 'Orta Etki' : 'Düşük Etki'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.risk)}`}>
                          {rec.risk === 'low' ? 'Düşük Risk' : rec.risk === 'medium' ? 'Orta Risk' : 'Yüksek Risk'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{rec.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mevcut Durum</p>
                        <p className="font-semibold text-gray-900">{rec.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Önerilen</p>
                        <p className="font-semibold text-blue-600">{rec.recommendedValue}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tasarruf</p>
                        <p className="font-semibold text-green-600">${rec.savings.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h6 className="font-semibold text-gray-900 mb-2">Uygulama Adımları:</h6>
                      <p className="text-sm text-gray-700 mb-2">{rec.implementation}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Zaman Çizelgesi: <span className="font-semibold">{rec.timeline}</span></span>
                        <span className="text-gray-500">Beklenen Tasarruf: <span className="font-semibold text-green-600">${rec.savings.toLocaleString()}</span></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h6 className="font-semibold text-red-700 mb-2 flex items-center">
                  <span className="mr-2">🔥</span>
                  Yüksek Öncelik ({optimization.priority.high.length})
                </h6>
                <p className="text-sm text-red-600">
                  Hemen uygulanması gereken kritik iyileştirmeler
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h6 className="font-semibold text-yellow-700 mb-2 flex items-center">
                  <span className="mr-2">⚡</span>
                  Orta Öncelik ({optimization.priority.medium.length})
                </h6>
                <p className="text-sm text-yellow-600">
                  Kısa vadede uygulanabilecek iyileştirmeler
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h6 className="font-semibold text-green-700 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Düşük Öncelik ({optimization.priority.low.length})
                </h6>
                <p className="text-sm text-green-600">
                  Uzun vadede değerlendirilebilecek öneriler
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIShipmentOptimization;
