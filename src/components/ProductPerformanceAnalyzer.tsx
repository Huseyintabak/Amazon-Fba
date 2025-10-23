import React, { useState } from 'react';
import { analyzeProductPerformance, ProductAnalysis } from '../lib/gemini';
import { Product } from '../types';

interface ProductPerformanceAnalyzerProps {
  product: Product;
}

const ProductPerformanceAnalyzer: React.FC<ProductPerformanceAnalyzerProps> = ({ product }) => {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const analyze = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsOpen(true);

      const result = await analyzeProductPerformance({
        name: product.name,
        asin: product.asin,
        product_cost: product.product_cost,
        amazon_price: product.amazon_price,
        estimated_profit: product.estimated_profit,
        profit_margin: product.profit_margin,
        roi_percentage: product.roi_percentage,
        units_sold: product.units_sold,
        revenue_generated: product.revenue_generated
      });

      setAnalysis(result);
    } catch (err) {
      console.error('Product analysis error:', err);
      setError('Analiz yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Mükemmel';
    if (score >= 60) return 'İyi';
    if (score >= 40) return 'Orta';
    return 'Düşük';
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={analyze}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI Performans Analizi"
      >
        <span className="mr-1">🤖</span>
        <span>{isLoading ? 'Analiz ediliyor...' : 'AI Analiz'}</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <h3 className="text-xl font-bold">AI Performans Analizi</h3>
                    <p className="text-sm text-purple-100 mt-1">{product.name}</p>
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
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <p className="mt-4 text-gray-600">AI ürünü analiz ediyor...</p>
                  <p className="text-sm text-gray-500 mt-2">Bu birkaç saniye sürebilir</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <span className="text-4xl block mb-3">⚠️</span>
                  <p className="text-red-700 font-medium">{error}</p>
                  <button
                    onClick={analyze}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Tekrar Dene
                  </button>
                </div>
              )}

              {!isLoading && !error && analysis && (
                <div className="space-y-6">
                  {/* Performance Score */}
                  <div className={`rounded-lg border-2 p-6 text-center ${getScoreColor(analysis.score)}`}>
                    <div className="text-5xl font-bold mb-2">{analysis.score}</div>
                    <div className="text-lg font-semibold">{getScoreLabel(analysis.score)}</div>
                    <div className="text-sm mt-1 opacity-75">Performans Skoru</div>
                  </div>

                  {/* Insights */}
                  {analysis.insights.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">💡</span>
                        Önemli İçgörüler
                      </h4>
                      <div className="space-y-2">
                        {analysis.insights.map((insight, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">✅</span>
                        Öneriler
                      </h4>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-900">→ {rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">💪</span>
                        Güçlü Yanlar
                      </h4>
                      <div className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <p className="text-sm text-emerald-900">✓ {strength}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {analysis.risks.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">⚠️</span>
                        Riskler
                      </h4>
                      <div className="space-y-2">
                        {analysis.risks.map((risk, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-900">! {risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      💡 Bu analiz Gemini Pro AI tarafından oluşturulmuştur.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {!isLoading && analysis && (
              <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between items-center">
                <button
                  onClick={analyze}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  🔄 Yeniden Analiz Et
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductPerformanceAnalyzer;

