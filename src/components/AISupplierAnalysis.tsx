import React, { useState } from 'react';
import { Product, Supplier } from '../types';

interface SupplierAnalysis {
  supplierId: string;
  supplierName: string;
  overallScore: number;
  performance: {
    reliability: number;
    quality: number;
    communication: number;
    pricing: number;
    delivery: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  marketPosition: 'leader' | 'competitive' | 'follower';
  futureOutlook: 'positive' | 'stable' | 'negative';
  costOptimization: {
    currentCost: number;
    suggestedCost: number;
    savings: number;
    negotiationTips: string[];
  };
}

interface AISupplierAnalysisProps {
  suppliers: Supplier[];
  products: Product[];
}

const AISupplierAnalysis: React.FC<AISupplierAnalysisProps> = ({
  suppliers,
  products
}) => {
  const [analysis, setAnalysis] = useState<SupplierAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use secure backend API instead of direct OpenAI call
      const { analyzeSupplier } = await import('../lib/aiApi');

      // Tedarikçi verilerini hazırla
      const supplierData = suppliers.map(supplier => {
        const supplierProducts = products.filter(p => p.supplier_id === supplier.id);
        const totalRevenue = supplierProducts.reduce((sum, p) => sum + (p.revenue_generated || 0), 0);
        const avgROI = supplierProducts.length > 0 
          ? supplierProducts.reduce((sum, p) => sum + (p.roi_percentage || 0), 0) / supplierProducts.length 
          : 0;
        const avgLeadTime = supplier.lead_time_days || 0;
        const rating = supplier.rating || 0;

        return {
          id: supplier.id,
          name: supplier.name,
          company: supplier.company_name,
          country: supplier.country,
          totalProducts: supplierProducts.length,
          totalRevenue,
          avgROI,
          avgLeadTime,
          rating,
          products: supplierProducts.map(p => ({
            name: p.name,
            profit: p.estimated_profit || 0,
            roi: p.roi_percentage || 0
          }))
        };
      });

      // Use secure backend API
      const response = await analyzeSupplier(supplierData);
      
      if (!response.success) {
        throw new Error(response.error || 'Tedarikçi analizi başarısız');
      }
      
      // Handle response data
      const result = response.data;
      setAnalysis(result.analysis || []);
    } catch (err: unknown) {
      console.error('AI Supplier Analysis error:', err);
      setError('Tedarikçi analizi yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'leader': return 'text-blue-700 bg-blue-100';
      case 'competitive': return 'text-green-700 bg-green-100';
      case 'follower': return 'text-gray-700 bg-gray-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getOutlookIcon = (outlook: string) => {
    switch (outlook) {
      case 'positive': return '📈';
      case 'stable': return '➡️';
      case 'negative': return '📉';
      default: return '❓';
    }
  };

  const filteredAnalysis = selectedSupplier === 'all' 
    ? analysis 
    : analysis.filter(a => a.supplierId === selectedSupplier);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <span>🏭</span>
              <span>AI Tedarikçi Analizi</span>
            </h3>
            <p className="text-gray-600">
              Tedarikçilerinizin performansını AI ile analiz edin
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Tedarikçiler</option>
              {suppliers?.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              )) || []}
            </select>
            <button
              onClick={generateAnalysis}
              disabled={isLoading || !suppliers || suppliers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? '🔄 Analiz Ediliyor...' : '🚀 Analizi Başlat'}
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
            <p className="text-gray-600">AI tedarikçi analizi yapıyor...</p>
            <p className="text-sm text-gray-500 mt-2">
              Performans metriklerini hesaplıyor ve öneriler oluşturuyor
            </p>
          </div>
        )}

        {!isLoading && analysis.length === 0 && !error && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">🏭</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              AI Tedarikçi Analizi
            </h4>
            <p className="text-gray-600 mb-6">
              Tedarikçilerinizin performansını analiz ederek iyileştirme önerileri alın
            </p>
            <button
              onClick={generateAnalysis}
              disabled={!suppliers || suppliers.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Analizi Başlat
            </button>
            {(!suppliers || suppliers.length === 0) && (
              <p className="text-sm text-gray-500 mt-2">
                Önce tedarikçi eklemeniz gerekiyor
              </p>
            )}
          </div>
        )}

        {filteredAnalysis.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                📊 Tedarikçi Analiz Raporu ({filteredAnalysis.length})
              </h4>
              <button
                onClick={generateAnalysis}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                🔄 Yenile
              </button>
            </div>

            <div className="space-y-6">
              {filteredAnalysis.map((supplier, idx) => (
                <div key={supplier.supplierId} className="bg-white border border-gray-200 rounded-lg p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h5 className="text-xl font-bold text-gray-900">{supplier.supplierName}</h5>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(supplier.overallScore)}`}>
                          Genel Skor: {supplier.overallScore}/100
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(supplier.riskLevel)}`}>
                          {supplier.riskLevel === 'low' ? 'Düşük Risk' : supplier.riskLevel === 'medium' ? 'Orta Risk' : 'Yüksek Risk'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(supplier.marketPosition)}`}>
                          {supplier.marketPosition === 'leader' ? 'Lider' : supplier.marketPosition === 'competitive' ? 'Rekabetçi' : 'Takipçi'}
                        </span>
                        <span className="flex items-center space-x-1 text-sm">
                          <span>{getOutlookIcon(supplier.futureOutlook)}</span>
                          <span className="capitalize">{supplier.futureOutlook}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {Object.entries(supplier.performance).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
                        <div className="text-xs text-gray-500 capitalize mb-2">
                          {key === 'reliability' ? 'Güvenilirlik' :
                           key === 'quality' ? 'Kalite' :
                           key === 'communication' ? 'İletişim' :
                           key === 'pricing' ? 'Fiyatlandırma' :
                           'Teslimat'}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              value >= 80 ? 'bg-green-500' : 
                              value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h6 className="font-semibold text-green-700 mb-3 flex items-center">
                        <span className="mr-2">✅</span>
                        Güçlü Yönler
                      </h6>
                      <ul className="space-y-2">
                        {supplier.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-semibold text-red-700 mb-3 flex items-center">
                        <span className="mr-2">⚠️</span>
                        İyileştirme Alanları
                      </h6>
                      <ul className="space-y-2">
                        {supplier.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-6">
                    <h6 className="font-semibold text-blue-700 mb-3 flex items-center">
                      <span className="mr-2">💡</span>
                      Öneriler
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {supplier.recommendations.map((rec, i) => (
                        <div key={i} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Optimization */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h6 className="font-semibold text-green-700 mb-3 flex items-center">
                      <span className="mr-2">💰</span>
                      Maliyet Optimizasyonu
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mevcut Maliyet</p>
                        <p className="font-semibold">${supplier.costOptimization.currentCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Önerilen Maliyet</p>
                        <p className="font-semibold text-green-600">${supplier.costOptimization.suggestedCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tasarruf</p>
                        <p className="font-semibold text-green-600">${supplier.costOptimization.savings.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Müzakere İpuçları:</p>
                      <ul className="space-y-1">
                        {supplier.costOptimization.negotiationTips.map((tip, i) => (
                          <li key={i} className="text-sm text-green-800 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISupplierAnalysis;
