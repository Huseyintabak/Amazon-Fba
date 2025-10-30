import React, { useState } from 'react';
import OpenAI from 'openai';
import { Product } from '../types';

interface ProductRecommendation {
  id: string;
  name: string;
  reason: string;
  confidence: number;
  category: string;
  expectedROI: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  competitionLevel: 'low' | 'medium' | 'high';
  investmentRequired: number;
  timeToProfit: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIProductRecommendationsProps {
  products: Product[];
  onAddProduct?: (product: Partial<Product>) => void;
}

const AIProductRecommendations: React.FC<AIProductRecommendationsProps> = ({
  products,
  onAddProduct
}) => {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Tüm Kategoriler', icon: '📦' },
    { value: 'electronics', label: 'Elektronik', icon: '📱' },
    { value: 'home', label: 'Ev & Yaşam', icon: '🏠' },
    { value: 'fashion', label: 'Moda', icon: '👕' },
    { value: 'beauty', label: 'Güzellik', icon: '💄' },
    { value: 'sports', label: 'Spor', icon: '⚽' },
    { value: 'toys', label: 'Oyuncak', icon: '🧸' },
    { value: 'books', label: 'Kitap', icon: '📚' }
  ];

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      // Mevcut ürünlerin analizi
      const currentProducts = products.map(p => ({
        name: p.name,
        category: p.category || 'unknown',
        profit: p.estimated_profit || 0,
        roi: p.roi_percentage || 0
      }));

      const prompt = `
Amazon FBA ürün önerileri oluştur:

MEVCUT ÜRÜNLER:
${currentProducts.map(p => `- ${p.name} (${p.category}): $${p.profit} kar, %${p.roi} ROI`).join('\n')}

GÖREV:
1. Mevcut ürünlerinizi analiz et
2. Başarılı ürünlerinizin özelliklerini belirle
3. Benzer kategorilerde 5 yeni ürün öner
4. Her öneri için detaylı analiz yap

KATEGORİ: ${selectedCategory === 'all' ? 'Tüm kategoriler' : categories.find(c => c.value === selectedCategory)?.label}

Her öneri için:
- Ürün adı (gerçekçi)
- Neden bu ürün (2-3 cümle)
- Güven skoru (0-100)
- Kategori
- Beklenen ROI (%)
- Pazar trendi (rising/stable/declining)
- Rekabet seviyesi (low/medium/high)
- Gerekli yatırım ($)
- Kar süresi (örn: "3-6 ay")
- Risk seviyesi (low/medium/high)

Türkçe ve Amazon FBA'ya uygun öneriler.
`;

      const schema = `{
  "recommendations": [
    {
      "id": "string",
      "name": "string",
      "reason": "string",
      "confidence": 85,
      "category": "electronics",
      "expectedROI": 45.5,
      "marketTrend": "rising",
      "competitionLevel": "medium",
      "investmentRequired": 2500,
      "timeToProfit": "3-6 ay",
      "riskLevel": "medium"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen Amazon FBA ürün araştırması uzmanı bir AI\'sın. SADECE JSON döndür.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nYanıtı aşağıdaki JSON formatında ver:\n${schema}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      setRecommendations(result.recommendations || []);
    } catch (err: unknown) {
      console.error('AI Recommendations error:', err);
      setError('Ürün önerileri oluşturulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'stable': return '➡️';
      case 'declining': return '📉';
      default: return '❓';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600 bg-green-50 border-green-200';
      case 'stable': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'declining': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const handleAddToProducts = (recommendation: ProductRecommendation) => {
    if (onAddProduct) {
      onAddProduct({
        name: recommendation.name,
        category: recommendation.category,
        estimated_profit: recommendation.investmentRequired * (recommendation.expectedROI / 100),
        roi_percentage: recommendation.expectedROI,
        product_cost: recommendation.investmentRequired,
        // Diğer alanlar kullanıcı tarafından doldurulacak
      });
    }
  };

  return (
    <div className="card">
      <div className="card-header border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title flex items-center space-x-2">
              <span>🎯</span>
              <span>AI Ürün Önerileri</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Mevcut ürünlerinizi analiz ederek yeni ürün önerileri alın
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <button
              onClick={generateRecommendations}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? '🔄 Analiz Ediliyor...' : '🚀 Önerileri Al'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
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
            <p className="text-gray-600">AI ürün önerileri oluşturuyor...</p>
            <p className="text-sm text-gray-500 mt-2">
              Mevcut ürünlerinizi analiz ediyor ve yeni fırsatlar arıyor
            </p>
          </div>
        )}

        {!isLoading && recommendations.length === 0 && !error && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">🎯</span>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              AI Ürün Önerileri
            </h4>
            <p className="text-gray-600 mb-6">
              Mevcut ürünlerinizi analiz ederek size özel ürün önerileri alın
            </p>
            <button
              onClick={generateRecommendations}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🚀 Önerileri Al
            </button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">
                💡 Önerilen Ürünler ({recommendations.length})
              </h4>
              <button
                onClick={generateRecommendations}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                🔄 Yenile
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => (
                <div key={rec.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 mb-2">{rec.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {rec.confidence}%
                      </span>
                      <span className="text-xs text-gray-500">Güven</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Beklenen ROI</p>
                      <p className="font-semibold text-green-600">%{rec.expectedROI}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gerekli Yatırım</p>
                      <p className="font-semibold">${rec.investmentRequired.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Kar Süresi</p>
                      <p className="font-semibold">{rec.timeToProfit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Kategori</p>
                      <p className="font-semibold capitalize">{rec.category}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(rec.marketTrend)}`}>
                      {getTrendIcon(rec.marketTrend)} {rec.marketTrend === 'rising' ? 'Yükselen' : rec.marketTrend === 'stable' ? 'Stabil' : 'Düşen'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompetitionColor(rec.competitionLevel)}`}>
                      {rec.competitionLevel === 'low' ? 'Düşük Rekabet' : rec.competitionLevel === 'medium' ? 'Orta Rekabet' : 'Yüksek Rekabet'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(rec.riskLevel)}`}>
                      {rec.riskLevel === 'low' ? 'Düşük Risk' : rec.riskLevel === 'medium' ? 'Orta Risk' : 'Yüksek Risk'}
                    </span>
                  </div>

                  {onAddProduct && (
                    <button
                      onClick={() => handleAddToProducts(rec)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      ➕ Ürünlere Ekle
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProductRecommendations;
