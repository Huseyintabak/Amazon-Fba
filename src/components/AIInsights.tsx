import React, { useState } from 'react';
import { generateDashboardInsights, type DashboardInsight } from '../lib/openai';
import { Product } from '../types';

interface AIInsightsProps {
  products: Product[];
  totalRevenue: number;
  totalProfit: number;
  averageROI: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  products,
  totalRevenue,
  totalProfit,
  averageROI
}) => {
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);

  // Don't auto-load, wait for user to click
  // useEffect removed to prevent automatic API calls

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setHasAttempted(true);

      // Validate data
      if (products.length === 0) {
        setError('Önce ürün eklemeniz gerekiyor.');
        setIsLoading(false);
        return;
      }

      // Prepare data for AI
      const sortedByProfit = [...products]
        .filter(p => p.estimated_profit !== undefined && p.estimated_profit !== null)
        .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0));

      const topProducts = sortedByProfit.slice(0, 3).map(p => ({
        name: p.name,
        profit: p.estimated_profit || 0
      }));

      const bottomProducts = sortedByProfit.slice(-3).reverse().map(p => ({
        name: p.name,
        profit: p.estimated_profit || 0
      }));

      const data = {
        totalProducts: products.length,
        totalRevenue: totalRevenue || 0,
        totalProfit: totalProfit || 0,
        averageROI: averageROI || 0,
        topProducts,
        bottomProducts
      };

      logger.log('AI Insights - Sending data:', data);

      const aiInsights = await generateDashboardInsights(data);
      logger.log('AI Insights - Received:', aiInsights);
      
      setInsights(aiInsights);
    } catch (err: unknown) {
      logger.error('AI Insights error:', err);
      const errorMessage = (err instanceof Error ? err.message : 'AI önerileri yüklenemedi.') || 'AI önerileri yüklenemedi.';
      setError(`${errorMessage} (CORS veya API hatası olabilir)`);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: DashboardInsight['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'danger':
        return '🚨';
      default:
        return '💡';
    }
  };

  const getInsightColor = (type: DashboardInsight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm border border-purple-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-bold text-gray-900">AI Önerileri</h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
            Beta
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {!isLoading && !error && (
            <button
              onClick={loadInsights}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
              title="Yenile"
            >
              🔄 Yenile
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-sm text-gray-600">AI analiz yapıyor...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadInsights}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {!isLoading && !error && insights.length > 0 && (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 transition-all hover:shadow-md ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm mb-2">{insight.message}</p>
                      {insight.action && (
                        <div className="flex items-center text-sm font-medium">
                          <span className="mr-1">→</span>
                          <span>{insight.action}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && insights.length === 0 && (
            <div className="text-center py-8">
              <span className="text-5xl block mb-3">🤖</span>
              <p className="text-sm text-gray-600 mb-1">
                {hasAttempted 
                  ? 'AI önerileri yüklenemedi.' 
                  : 'AI henüz işletmenizi analiz etmedi.'}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {products.length > 0 
                  ? 'OpenAI GPT-4 ile akıllı öneriler alın!'
                  : 'Önce birkaç ürün ekleyin.'}
              </p>
              <button
                onClick={loadInsights}
                disabled={products.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 AI Analizi Başlat
              </button>
              <p className="text-xs text-gray-400 mt-3">
                💡 Not: İlk seferinde birkaç saniye sürebilir
              </p>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {isExpanded && !isLoading && !error && insights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <p className="text-xs text-gray-500 text-center">
            💡 AI önerileri OpenAI GPT-4 tarafından oluşturulmuştur.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

