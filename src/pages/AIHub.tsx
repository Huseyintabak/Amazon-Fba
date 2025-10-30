import React, { useMemo } from 'react';
import { useStore } from '../stores/useStore';
import AIInsightsHub from '../components/AIInsightsHub';
import PremiumBlur from '../components/PremiumBlur';

const AIHub: React.FC = () => {
  const { products, shipments, suppliers, loadAllData } = useStore();

  // Load all data on mount
  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
    <PremiumBlur 
      featureName="AI Hub" 
      description="AI Hub, gelişmiş AI analizleri ve önerileri için Pro plan gerektirir."
      allowedFeatures={['ai-chat']}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-8 sm:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Hub</h1>
                  <p className="text-gray-600 mt-1">
                    Yapay zeka destekli analizler ve öneriler
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Toplam Gelir</p>
                    <p className="text-xl font-bold text-gray-900">${metrics.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Toplam Kar</p>
                    <p className="text-xl font-bold text-gray-900">${metrics.totalProfit.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Ortalama ROI</p>
                    <p className="text-xl font-bold text-gray-900">%{metrics.averageROI.toFixed(1)}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features Section */}
            <div className="space-y-6">
              {/* 🤖 AI Insights Hub - Tüm AI Özellikleri */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <AIInsightsHub
                  products={products}
                  shipments={shipments}
                  suppliers={suppliers}
                />
              </div>

              {/* How to Use Section */}
              <div className="mt-12">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Nasıl Kullanılır?</h2>
                  <p className="text-gray-600">
                    AI özelliklerini kullanarak işletmenizi büyütmek için bu adımları takip edin
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">💬</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">AI Chat Asistan</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Sağ alt köşedeki 🤖 butona tıklayarak AI asistanınızla sohbet edebilirsiniz.
                        </p>
                        <div className="bg-blue-50 rounded p-2">
                          <p className="text-xs text-blue-800 font-medium">
                            💡 Örnek: "En karlı ürünlerim hangileri?"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🤖</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">Ürün Analizi</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Products sayfasında her ürünün yanındaki "AI Analiz" butonu ile detaylı analiz alın.
                        </p>
                        <div className="bg-green-50 rounded p-2">
                          <p className="text-xs text-green-800 font-medium">
                            📊 Performans skoru, öneriler, riskler
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">💰</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2">Fiyat Optimizasyonu</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Products sayfasında "Fiyat Öner" butonu ile AI destekli fiyat önerileri alın.
                        </p>
                        <div className="bg-purple-50 rounded p-2">
                          <p className="text-xs text-purple-800 font-medium">
                            🎯 Kar maksimizasyonu için optimal fiyat
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="mt-12">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">🎯 AI Yetenekleri</h2>
                  <p className="text-gray-600">
                    Güçlü yapay zeka teknolojisi ile işletmenizi bir üst seviyeye taşıyın
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-3">📊</div>
                    <h4 className="font-bold text-gray-900 mb-2">Veri Analizi</h4>
                    <p className="text-sm text-gray-600">
                      Tüm işletme verilerinizi analiz eder ve içgörüler sunar
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-3">🔮</div>
                    <h4 className="font-bold text-gray-900 mb-2">Tahminleme</h4>
                    <p className="text-sm text-gray-600">
                      Gelecek satışları ve trendleri tahmin eder
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-3">💡</div>
                    <h4 className="font-bold text-gray-900 mb-2">Akıllı Öneriler</h4>
                    <p className="text-sm text-gray-600">
                      İşletmenizi büyütmek için stratejiler önerir
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="text-2xl mb-3">⚡</div>
                    <h4 className="font-bold text-gray-900 mb-2">Otomatizasyon</h4>
                    <p className="text-sm text-gray-600">
                      Rutin analizleri otomatik olarak yapar
                    </p>
                  </div>
                </div>
              </div>

              {/* Usage Tips */}
              <div className="mt-12">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">💡 Kullanım İpuçları</h2>
                    <p className="text-gray-600">
                      AI özelliklerinden maksimum verim almak için bu ipuçlarını takip edin
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">1</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Trend Analizi</h4>
                        <p className="text-sm text-gray-700">
                          Her hafta trend analizini yenileyin ve satış tahminlerinizi güncel tutun
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Stok Uyarıları</h4>
                        <p className="text-sm text-gray-700">
                          Kritik urgency seviyesindeki ürünler için hemen aksiyon alın
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Pazarlama Önerileri</h4>
                        <p className="text-sm text-gray-700">
                          High priority önerileri önce uygulayın, ROI'yi maksimize edin
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">4</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">AI Chat</h4>
                        <p className="text-sm text-gray-700">
                          Spesifik sorularınız için chat asistanını kullanın, gerçek zamanlı yanıt alın
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note: AI Chat Assistant is now globally available via Layout component */}
      </div>
    </PremiumBlur>
  );
};

export default AIHub;



