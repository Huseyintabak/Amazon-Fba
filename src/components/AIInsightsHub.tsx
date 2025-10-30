import React, { useState } from 'react';
import { Product, Shipment, Supplier } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AISupplierAnalysis from './AISupplierAnalysis';
import AIShipmentOptimization from './AIShipmentOptimization';
import AIPriceOptimization from './AIPriceOptimization';
import { logger } from '../lib/logger';

interface AIInsightsHubProps {
  products: Product[];
  shipments: Shipment[];
  suppliers?: Supplier[];
}

interface TrendAnalysis {
  trend: 'up' | 'down' | 'stable';
  forecast: string;
  insights: string[];
  monthlyPrediction: Array<{ month: string; predicted: number }>;
}

interface InventoryAlert {
  product: string;
  currentStock: number;
  daysLeft: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction: string;
  recommendedQuantity: number;
}

interface MarketingSuggestion {
  category: string;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

const AIInsightsHub: React.FC<AIInsightsHubProps> = ({ products, shipments, suppliers = [] }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'inventory' | 'marketing' | 'suppliers' | 'shipments' | 'pricing'>('trends');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trend Analysis State
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);

  // Inventory Alerts State
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);

  // Marketing Suggestions State
  const [marketingSuggestions, setMarketingSuggestions] = useState<MarketingSuggestion[]>([]);

  const analyzeTrends = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const monthlyData = calculateMonthlyMetrics();
      
      // Use secure backend API instead of direct OpenAI call
      const { analyzeTrends: analyzeTrendsAPI } = await import('../lib/aiApi');

      // Use secure backend API
      const response = await analyzeTrendsAPI(monthlyData);
      
      if (!response.success) {
        throw new Error(response.error || 'Trend analizi başarısız');
      }
      
      const result = response.data;
      logger.log('Trend analysis result:', result);
      logger.log('Trend analysis insights:', result.insights);
      setTrendAnalysis(result);
    } catch (err: unknown) {
      logger.error('Trend analysis error:', err);
      setError('Trend analizi yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeInventory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const topProducts = products
        .filter(p => p.name) // Sadece ismi olan ürünleri al
        .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0))
        .slice(0, 10);

      const { analyzeInventory: analyzeInventoryAPI } = await import('../lib/aiApi');
      
      const productData = topProducts.map(p => ({
        name: p.name,
        currentStock: 0, // current_inventory kolonu yok, varsayılan 0
        sales: p.units_sold || 0,
        profit: p.estimated_profit || 0
      }));

      logger.log('Top products:', topProducts);
      logger.log('Product data sent to AI:', productData);
      logger.log('First product name:', topProducts[0]?.name);

      const response = await analyzeInventoryAPI(productData);
      
      logger.log('Inventory analysis response:', response);
      logger.log('Response alerts:', response.data?.alerts);
      
      if (response.success && response.data) {
        const alerts = response.data.alerts || [];
        logger.log('Setting inventory alerts:', alerts);
        setInventoryAlerts(Array.isArray(alerts) ? alerts : []);
      } else {
        logger.error('Inventory analysis failed:', response.error);
        throw new Error(response.error || 'Inventory analysis failed');
      }
    } catch (err: unknown) {
      logger.error('Inventory analysis error:', err);
      setError('Stok analizi yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarketingSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const topProducts = products
        .filter(p => p.name) // Sadece ismi olan ürünleri al
        .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0))
        .slice(0, 10);

      const { getMarketingSuggestions } = await import('../lib/aiApi');
      
      const productData = topProducts.map(p => ({
        name: p.name,
        profit: p.estimated_profit || 0,
        sales: p.units_sold || 0,
        roi: p.roi_percentage || 0
      }));

      const response = await getMarketingSuggestions(productData);
      
      if (response.success && response.data) {
        const suggestions = response.data.suggestions || [];
        setMarketingSuggestions(Array.isArray(suggestions) ? suggestions : []);
      } else {
        throw new Error(response.error || 'Marketing suggestions failed');
      }
    } catch (err: unknown) {
      logger.error('Marketing suggestions error:', err);
      setError('Pazarlama önerileri oluşturulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMonthlyMetrics = () => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
    return months.map((month, index) => {
      const monthShipments = shipments.filter(s => {
        const shipmentDate = new Date(s.shipment_date);
        return shipmentDate.getMonth() === index;
      });

      const revenue = monthShipments.reduce((sum, s) => sum + (s.total_shipping_cost || 0), 0);

      return {
        month,
        shipments: monthShipments.length,
        revenue
      };
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      default: return '💡';
    }
  };

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'trends'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Trend
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📦 Stok
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'marketing'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📣 Pazarlama
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏭 Tedarikçi
        </button>
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-4 py-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'shipments'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🚚 Sevkiyat
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-4 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'pricing'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          💰 Fiyat
        </button>
      </div>

      {/* Content */}
      <div>
        {/* Trend Analysis Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin text-6xl block mb-4">⚙️</div>
                <p className="text-gray-600">AI analiz yapıyor...</p>
              </div>
            )}

            {!isLoading && !trendAnalysis && !error && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">📈</span>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Satış Trendi Analizi
                </h4>
                <p className="text-gray-600 mb-6">
                  AI ile satış trendlerinizi analiz edin ve gelecek tahminleri alın
                </p>
                <button
                  onClick={analyzeTrends}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🚀 Trend Analizi Başlat
                </button>
              </div>
            )}

            {error && !trendAnalysis && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">⚠️</span>
                <h4 className="text-lg font-semibold text-red-600 mb-2">
                  Hata: {error}
                </h4>
                <button
                  onClick={analyzeTrends}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                >
                  🔄 Tekrar Dene
                </button>
              </div>
            )}

            {trendAnalysis && (
              <div className="space-y-6">
                {/* Trend Overview */}
                <div className={`p-6 rounded-lg border-2 ${
                  trendAnalysis.trend === 'up' ? 'bg-green-50 border-green-200' :
                  trendAnalysis.trend === 'down' ? 'bg-red-50 border-red-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        Trend: {trendAnalysis.trend === 'up' ? '📈 Yükseliş' : trendAnalysis.trend === 'down' ? '📉 Düşüş' : '➡️ Stabil'}
                      </h4>
                      <p className="text-gray-700">{trendAnalysis.forecast}</p>
                    </div>
                    <button
                      onClick={analyzeTrends}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      🔄 Yenile
                    </button>
                  </div>
                </div>

                {/* Insights */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">💡 Önemli İçgörüler</h4>
                  <div className="space-y-2">
                    {trendAnalysis.insights && trendAnalysis.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-blue-600 font-bold">{idx + 1}.</span>
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Predictions Chart */}
                {trendAnalysis.monthlyPrediction && trendAnalysis.monthlyPrediction.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">📊 Gelecek Tahminleri</h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={trendAnalysis.monthlyPrediction}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin text-6xl block mb-4">⚙️</div>
                <p className="text-gray-600">AI analiz yapıyor...</p>
              </div>
            )}

            {!isLoading && inventoryAlerts.length === 0 && !error && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">📦</span>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Akıllı Stok Optimizasyonu
                </h4>
                <p className="text-gray-600 mb-6">
                  AI ile stok seviyelerinizi analiz edin ve sipariş önerileri alın
                </p>
                <button
                  onClick={analyzeInventory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🚀 Stok Analizi Başlat
                </button>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">⚠️</span>
                <h4 className="text-lg font-semibold text-red-600 mb-2">
                  Hata: {error}
                </h4>
                <button
                  onClick={analyzeInventory}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                >
                  🔄 Tekrar Dene
                </button>
              </div>
            )}

            {inventoryAlerts.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">
                    📋 Stok Uyarıları ({inventoryAlerts.length})
                  </h4>
                  <button
                    onClick={analyzeInventory}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    🔄 Yenile
                  </button>
                </div>

                {inventoryAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${getUrgencyColor(alert.urgency)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold">{alert.product}</h5>
                      <span className="text-xs font-bold uppercase px-2 py-1 rounded">
                        {alert.urgency}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Mevcut Stok:</span>
                        <span className="font-semibold ml-1">{alert.currentStock} birim</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Kalan Süre:</span>
                        <span className="font-semibold ml-1">{alert.daysLeft} gün</span>
                      </div>
                    </div>
                    <div className="bg-white/50 p-3 rounded">
                      <p className="text-sm font-medium mb-1">💡 Önerilen Aksiyon:</p>
                      <p className="text-sm">{alert.recommendedAction}</p>
                      <p className="text-sm font-bold mt-2">
                        📦 Sipariş Miktarı: {alert.recommendedQuantity} birim
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin text-6xl block mb-4">⚙️</div>
                <p className="text-gray-600">AI analiz yapıyor...</p>
              </div>
            )}

            {!isLoading && marketingSuggestions.length === 0 && !error && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">📣</span>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  AI Pazarlama Stratejileri
                </h4>
                <p className="text-gray-600 mb-6">
                  İşletmenize özel pazarlama önerileri ve stratejiler alın
                </p>
                <button
                  onClick={generateMarketingSuggestions}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🚀 Pazarlama Önerileri Al
                </button>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">⚠️</span>
                <h4 className="text-lg font-semibold text-red-600 mb-2">
                  Hata: {error}
                </h4>
                <button
                  onClick={generateMarketingSuggestions}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                >
                  🔄 Tekrar Dene
                </button>
              </div>
            )}

            {marketingSuggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-900">
                    🎯 Pazarlama Stratejileri ({marketingSuggestions.length})
                  </h4>
                  <button
                    onClick={generateMarketingSuggestions}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    🔄 Yenile
                  </button>
                </div>

                {marketingSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-bold text-gray-900 flex items-center space-x-2">
                        <span>{getPriorityIcon(suggestion.priority)}</span>
                        <span>{suggestion.category}</span>
                      </h5>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {suggestion.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      {suggestion.suggestions.map((item, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <span className="text-blue-600">✓</span>
                          <p className="text-sm text-gray-700">{item}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Beklenen Etki:</span> {suggestion.expectedImpact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Supplier Analysis Tab */}
        {activeTab === 'suppliers' && (
          <div className="pt-4">
            <AISupplierAnalysis
              suppliers={suppliers}
              products={products}
            />
          </div>
        )}

        {/* Shipment Optimization Tab */}
        {activeTab === 'shipments' && (
          <div className="pt-4">
            <AIShipmentOptimization
              shipments={shipments}
              products={products}
            />
          </div>
        )}

        {/* Price Optimization Tab */}
        {activeTab === 'pricing' && (
          <div className="pt-4">
            <AIPriceOptimization
              products={products}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsHub;


