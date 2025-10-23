import React, { useState } from 'react';
import OpenAI from 'openai';
import { Product, Shipment } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AIInsightsHubProps {
  products: Product[];
  shipments: Shipment[];
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

const AIInsightsHub: React.FC<AIInsightsHubProps> = ({ products, shipments }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'inventory' | 'marketing'>('trends');
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
      
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
Amazon FBA işletme trend analizi:

Aylık Veriler (son 6 ay):
${monthlyData.map(m => `${m.month}: ${m.shipments} sevkiyat, $${m.revenue.toFixed(2)} gelir`).join('\n')}

GÖREV:
1. Trend yönünü belirle (up/down/stable)
2. Gelecek 3 ay için tahmin yap
3. 3-4 önemli içgörü ver
4. Her ay için tahmini rakam ver

Kısa ve net ol. Türkçe.
`;

      const schema = `{
  "trend": "up",
  "forecast": "string",
  "insights": ["string"],
  "monthlyPrediction": [
    {"month": "Ocak", "predicted": 0}
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen Amazon FBA için trend analisti bir AI\'sın. SADECE JSON döndür.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nYanıtı aşağıdaki JSON formatında ver:\n${schema}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      setTrendAnalysis(result);
    } catch (err: any) {
      console.error('Trend analysis error:', err);
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
        .filter(p => p.estimated_profit && p.estimated_profit > 0)
        .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0))
        .slice(0, 10);

      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
Top 10 karlı ürün için stok analizi:

${topProducts.map((p, i) => `${i + 1}. ${p.name}
   - Kar: $${p.estimated_profit?.toFixed(2)}
   - ROI: ${p.roi_percentage?.toFixed(1)}%`).join('\n\n')}

Her ürün için:
1. Tahmini stok durumu (simüle et)
2. Kaç gün kalacağını tahmin et
3. Urgency (low/medium/high/critical)
4. Önerilen aksiyon
5. Sipariş miktarı

5 ürün için array döndür.
`;

      const schema = `{
  "alerts": [
    {
      "product": "string",
      "currentStock": 0,
      "daysLeft": 0,
      "urgency": "high",
      "recommendedAction": "string",
      "recommendedQuantity": 0
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen Amazon FBA stok yönetimi uzmanı bir AI\'sın. SADECE JSON döndür.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${schema}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      setInventoryAlerts(result.alerts || []);
    } catch (err: any) {
      console.error('Inventory analysis error:', err);
      setError('Stok analizi yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarketingSuggestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const totalProducts = products.length;
      const profitableProducts = products.filter(p => (p.estimated_profit || 0) > 0).length;
      const avgROI = products.reduce((sum, p) => sum + (p.roi_percentage || 0), 0) / products.length;

      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
Amazon FBA işletme için pazarlama stratejisi:

İşletme Profili:
- Toplam Ürün: ${totalProducts}
- Karlı Ürün: ${profitableProducts}
- Ortalama ROI: ${avgROI.toFixed(1)}%

4-5 kategori için pazarlama önerisi ver:
1. Amazon PPC (Sponsored Products)
2. Social Media Marketing
3. Email Marketing
4. Content Marketing
5. Influencer Partnerships

Her kategori için:
- 2-3 actionable öneri
- Priority (high/medium/low)
- Beklenen etki

Türkçe ve somut öneriler.
`;

      const schema = `{
  "suggestions": [
    {
      "category": "string",
      "suggestions": ["string"],
      "priority": "high",
      "expectedImpact": "string"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen Amazon FBA pazarlama uzmanı bir AI\'sın. SADECE JSON döndür.'
          },
          {
            role: 'user',
            content: `${prompt}\n\n${schema}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      setMarketingSuggestions(result.suggestions || []);
    } catch (err: any) {
      console.error('Marketing suggestions error:', err);
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

      const revenue = monthShipments.reduce((sum, s) => sum + (s.total_cost || 0), 0);

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
    <div className="card">
      <div className="card-header border-b border-gray-200">
        <h3 className="card-title">🤖 AI Insights Hub</h3>
        <p className="text-sm text-gray-600 mt-1">Gelişmiş AI analizleri ve öneriler</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'trends'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📈 Trend Analizi
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📦 Stok Optimizasyonu
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'marketing'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📣 Pazarlama Önerileri
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Trend Analysis Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {!trendAnalysis && !isLoading && (
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
                    {trendAnalysis.insights.map((insight, idx) => (
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
            {inventoryAlerts.length === 0 && !isLoading && (
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
            {marketingSuggestions.length === 0 && !isLoading && (
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">AI analiz yapıyor...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsHub;

