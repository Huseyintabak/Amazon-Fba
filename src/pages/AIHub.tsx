import React, { useMemo } from 'react';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import AIInsights from '../components/AIInsights';
import AIInsightsHub from '../components/AIInsightsHub';

const AIHub: React.FC = () => {
  const { products, shipments } = useSupabaseStore();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = products.reduce((sum, p) => sum + ((p.revenue_generated || 0)), 0);
    const totalProfit = products.reduce((sum, p) => sum + (p.estimated_profit || 0), 0);
    const averageROI = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.roi_percentage || 0), 0) / products.length 
      : 0;
    
    return { totalRevenue, totalProfit, averageROI };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <span className="text-4xl">🤖</span>
          <span>AI Hub</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Yapay zeka destekli iş analizleri, öneriler ve tahminler
        </p>
        <div className="mt-4 flex items-center space-x-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
            Powered by GPT-4o-mini
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            AI Aktif
          </span>
        </div>
      </div>

      {/* AI Features Grid */}
      <div className="space-y-6">
        {/* Quick AI Insights */}
        <AIInsights
          products={products}
          totalRevenue={metrics.totalRevenue}
          totalProfit={metrics.totalProfit}
          averageROI={metrics.averageROI}
        />

        {/* Advanced AI Analysis */}
        <AIInsightsHub
          products={products}
          shipments={shipments}
        />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💬</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">AI Chat Asistan</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Sağ alt köşedeki 🤖 butona tıklayarak AI asistanınızla sohbet edebilirsiniz.
                </p>
                <p className="text-xs text-gray-500">
                  Örnek: "En karlı ürünlerim hangileri?"
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Ürün Analizi</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Products sayfasında her ürünün yanındaki "AI Analiz" butonu ile detaylı analiz alın.
                </p>
                <p className="text-xs text-gray-500">
                  Performans skoru, öneriler, riskler
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Fiyat Optimizasyonu</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Products sayfasında "Fiyat Öner" butonu ile AI destekli fiyat önerileri alın.
                </p>
                <p className="text-xs text-gray-500">
                  Kar maksimizasyonu için optimal fiyat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">🎯 AI Yetenekleri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900 mb-1">Veri Analizi</h4>
              <p className="text-xs text-gray-600">
                Tüm işletme verilerinizi analiz eder ve içgörüler sunar
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="text-3xl mb-2">🔮</div>
              <h4 className="font-semibold text-gray-900 mb-1">Tahminleme</h4>
              <p className="text-xs text-gray-600">
                Gelecek satışları ve trendleri tahmin eder
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-semibold text-gray-900 mb-1">Akıllı Öneriler</h4>
              <p className="text-xs text-gray-600">
                İşletmenizi büyütmek için stratejiler önerir
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900 mb-1">Otomatizasyon</h4>
              <p className="text-xs text-gray-600">
                Rutin analizleri otomatik olarak yapar
              </p>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <h3 className="font-bold text-gray-900 mb-4">💡 Kullanım İpuçları</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 font-bold">1.</span>
              <p className="text-sm text-gray-700">
                <strong>Trend Analizi:</strong> Her hafta trend analizini yenileyin ve satış tahminlerinizi güncel tutun
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 font-bold">2.</span>
              <p className="text-sm text-gray-700">
                <strong>Stok Uyarıları:</strong> Kritik urgency seviyesindeki ürünler için hemen aksiyon alın
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 font-bold">3.</span>
              <p className="text-sm text-gray-700">
                <strong>Pazarlama Önerileri:</strong> High priority önerileri önce uygulayın, ROI'yi maksimize edin
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-600 font-bold">4.</span>
              <p className="text-sm text-gray-700">
                <strong>AI Chat:</strong> Spesifik sorularınız için chat asistanını kullanın, gerçek zamanlı yanıt alın
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note: AI Chat Assistant is now globally available via Layout component */}
    </div>
  );
};

export default AIHub;

