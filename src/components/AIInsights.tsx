import React, { useState, useEffect } from 'react';
import { generateDashboardInsights, DashboardInsight } from '../lib/gemini';
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

  useEffect(() => {
    if (products.length > 0) {
      loadInsights();
    }
  }, [products.length]); // Only reload when product count changes

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare data for AI
      const sortedByProfit = [...products]
        .filter(p => p.estimated_profit !== undefined)
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
        totalRevenue,
        totalProfit,
        averageROI,
        topProducts,
        bottomProducts
      };

      const aiInsights = await generateDashboardInsights(data);
      setInsights(aiInsights);
    } catch (err) {
      console.error('AI Insights error:', err);
      setError('AI önerileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
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
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Henüz AI önerisi yok.</p>
              <button
                onClick={loadInsights}
                className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                İlk Analizi Başlat
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {isExpanded && !isLoading && !error && insights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-purple-200">
          <p className="text-xs text-gray-500 text-center">
            💡 AI önerileri Gemini Pro tarafından oluşturulmuştur.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

