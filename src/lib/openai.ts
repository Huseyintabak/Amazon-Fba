import OpenAI from 'openai';
import { getErrorMessage } from './errorHandler';

// AI Response Types
export interface DashboardInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}

export interface ProductAnalysis {
  insight: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PriceOptimization {
  currentPrice: number;
  recommendedPrice: number;
  reason: string;
  expectedImpact: string;
}

// OpenAI API Configuration
// Note: In production, use environment variables instead of hardcoding
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development/demo
});

// Helper: Generate structured JSON response using GPT-4
async function generateStructuredResponse<T>(
  prompt: string,
  schema: string
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Faster and cheaper than gpt-4
      messages: [
        {
          role: 'system',
          content: 'Sen Amazon FBA işletmeleri için akıllı öneriler yapan bir AI asistanısın. Yanıtlarını SADECE JSON formatında ver, başka açıklama ekleme.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nYanıtı aşağıdaki JSON formatında ver:\n${schema}\n\nSADECE JSON döndür, başka metin ekleme.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI yanıt vermedi');
    }

    return JSON.parse(content);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('OpenAI API Error:', errorMessage);
    
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      if (status === 401) {
        throw new Error('API key geçersiz');
      }
      if (status === 429) {
        throw new Error('API rate limit aşıldı');
      }
    }
    if (error?.message?.includes('fetch')) {
      throw new Error('Bağlantı hatası');
    }
    
    throw new Error(error?.message || 'AI yanıt oluşturulamadı');
  }
}

// Generate dashboard insights
export async function generateDashboardInsights(data: {
  totalProducts: number;
  totalRevenue: number;
  totalProfit: number;
  averageROI: number;
  topProducts: Array<{ name: string; profit: number }>;
  bottomProducts: Array<{ name: string; profit: number }>;
}): Promise<DashboardInsight[]> {
  const prompt = `
Amazon FBA işletme verileri:

Toplam Ürün: ${data.totalProducts}
Toplam Gelir: $${data.totalRevenue.toFixed(2)}
Toplam Kar: $${data.totalProfit.toFixed(2)}
Ortalama ROI: ${data.averageROI.toFixed(1)}%

En Karlı Ürünler:
${data.topProducts.map(p => `- ${p.name}: $${p.profit.toFixed(2)}`).join('\n')}

En Düşük Performans:
${data.bottomProducts.map(p => `- ${p.name}: $${p.profit.toFixed(2)}`).join('\n')}

3-4 akıllı içgörü üret. Her biri şunları içermeli:
- type: "success" veya "warning" veya "info" veya "danger"
- title: Kısa başlık (max 50 karakter)
- message: Açıklama (1-2 cümle, max 150 karakter)
- action: Eylem önerisi (opsiyonel, max 80 karakter)

Türkçe ve eylem odaklı ol. Sayıları ve yüzdeleri kullan.
`;

  const schema = `{
  "insights": [
    {
      "type": "success",
      "title": "string",
      "message": "string",
      "action": "string"
    }
  ]
}`;

  const result = await generateStructuredResponse<{ insights: DashboardInsight[] }>(prompt, schema);
  return result.insights;
}

// Analyze product performance
export async function analyzeProductPerformance(product: {
  name: string;
  asin: string;
  product_cost?: number;
  amazon_price?: number;
  estimated_profit?: number;
  profit_margin?: number;
  roi_percentage?: number;
  units_sold?: number;
  revenue_generated?: number;
}): Promise<ProductAnalysis> {
  const prompt = `
Amazon FBA ürünü analiz et:

Ürün: ${product.name}
ASIN: ${product.asin}
Maliyet: $${product.product_cost || 0}
Amazon Fiyatı: $${product.amazon_price || 0}
Tahmini Kar: $${product.estimated_profit || 0}
Kar Marjı: ${product.profit_margin || 0}%
ROI: ${product.roi_percentage || 0}%
Satılan Birim: ${product.units_sold || 0}
Toplam Gelir: $${product.revenue_generated || 0}

Analiz yap:
1. Performans Skoru (0-100): Genel başarı
2. İçgörüler: 2-3 önemli bulgu
3. Öneriler: 2-3 eylem önerisi
4. Riskler: Potansiyel sorunlar (varsa, yoksa boş array)
5. Güçlü Yanlar: Pozitif özellikler

Kısa ve net ol. Türkçe.
`;

  const schema = `{
  "score": 0,
  "insights": ["string"],
  "recommendations": ["string"],
  "risks": ["string"],
  "strengths": ["string"]
}`;

  return generateStructuredResponse<ProductAnalysis>(prompt, schema);
}

// Optimize price
export async function optimizePrice(product: {
  name: string;
  product_cost?: number;
  amazon_price?: number;
  estimated_profit?: number;
  profit_margin?: number;
  units_sold?: number;
}): Promise<PriceOptimization> {
  const prompt = `
Amazon FBA ürünü için fiyat optimizasyonu:

Ürün: ${product.name}
Mevcut Fiyat: $${product.amazon_price || 0}
Maliyet: $${product.product_cost || 0}
Mevcut Kar: $${product.estimated_profit || 0}
Kar Marjı: ${product.profit_margin || 0}%
Aylık Satış: ${product.units_sold || 0} birim

Optimal fiyat öner. Hem karlılığı hem de satış hacmini dikkate al.
`;

  const schema = `{
  "currentPrice": 0,
  "suggestedPrice": 0,
  "reasoning": "string",
  "expectedImpact": {
    "profitChange": "string",
    "demandChange": "string"
  }
}`;

  return generateStructuredResponse<PriceOptimization>(prompt, schema);
}

export default {
  generateDashboardInsights,
  analyzeProductPerformance,
  optimizePrice
};

