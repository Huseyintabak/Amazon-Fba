import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyBamRJ6VFw9YZ3x36RyTW8NgpMp8_uzXTQ';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the Gemini Pro model
export const getGeminiModel = (modelName: 'gemini-pro' | 'gemini-pro-vision' = 'gemini-pro') => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Helper: Generate text response
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Better error messages
    if (error?.message?.includes('fetch')) {
      throw new Error('Bağlantı hatası - İnternet bağlantınızı kontrol edin');
    }
    if (error?.message?.includes('API key')) {
      throw new Error('API key hatası');
    }
    if (error?.message?.includes('quota')) {
      throw new Error('API kotası doldu');
    }
    
    throw new Error(error?.message || 'AI yanıt oluşturulamadı');
  }
};

// Helper: Generate structured JSON response
export const generateStructuredResponse = async <T>(
  prompt: string,
  schema: string
): Promise<T> => {
  try {
    const fullPrompt = `${prompt}\n\nLütfen yanıtı aşağıdaki JSON formatında ver:\n${schema}\n\nSadece JSON döndür, açıklama ekleme.`;
    const response = await generateAIResponse(fullPrompt);
    
    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error('Structured response parsing error:', error);
    throw new Error('AI yapılandırılmış yanıt oluşturulamadı');
  }
};

// Helper: Analyze product performance
export interface ProductAnalysis {
  score: number; // 0-100
  insights: string[];
  recommendations: string[];
  risks: string[];
  strengths: string[];
}

export const analyzeProductPerformance = async (product: {
  name: string;
  asin: string;
  product_cost?: number;
  amazon_price?: number;
  estimated_profit?: number;
  profit_margin?: number;
  roi_percentage?: number;
  units_sold?: number;
  revenue_generated?: number;
}): Promise<ProductAnalysis> => {
  const prompt = `
Amazon FBA ürünü analiz et:

Ürün Bilgileri:
- Ürün Adı: ${product.name}
- ASIN: ${product.asin}
- Maliyet: $${product.product_cost || 0}
- Amazon Fiyatı: $${product.amazon_price || 0}
- Tahmini Kar: $${product.estimated_profit || 0}
- Kar Marjı: ${product.profit_margin || 0}%
- ROI: ${product.roi_percentage || 0}%
- Satılan Birim: ${product.units_sold || 0}
- Toplam Gelir: $${product.revenue_generated || 0}

Lütfen aşağıdaki analizi yap:
1. Performans Skoru (0-100): Genel başarı değerlendirmesi
2. Önemli İçgörüler: 2-3 önemli bulgu
3. Öneriler: 2-3 eylem önerisi
4. Riskler: Potansiyel sorunlar (varsa)
5. Güçlü Yanlar: Pozitif özellikler

Türkçe, kısa ve net yanıt ver.
`;

  const schema = `{
  "score": number,
  "insights": ["içgörü 1", "içgörü 2"],
  "recommendations": ["öneri 1", "öneri 2"],
  "risks": ["risk 1"],
  "strengths": ["güçlü yan 1"]
}`;

  return generateStructuredResponse<ProductAnalysis>(prompt, schema);
};

// Helper: Generate price optimization suggestions
export interface PriceOptimization {
  currentPrice: number;
  suggestedPrice: number;
  reasoning: string;
  expectedImpact: {
    profitChange: string;
    demandChange: string;
  };
}

export const optimizePrice = async (product: {
  name: string;
  product_cost?: number;
  amazon_price?: number;
  estimated_profit?: number;
  profit_margin?: number;
  units_sold?: number;
}): Promise<PriceOptimization> => {
  const prompt = `
Amazon FBA ürünü için fiyat optimizasyonu:

Ürün: ${product.name}
Mevcut Fiyat: $${product.amazon_price || 0}
Maliyet: $${product.product_cost || 0}
Mevcut Kar: $${product.estimated_profit || 0}
Kar Marjı: ${product.profit_margin || 0}%
Aylık Satış: ${product.units_sold || 0} birim

Optimal fiyat önerisi yap. Hem karlılığı hem de satış hacmini dikkate al.
`;

  const schema = `{
  "currentPrice": number,
  "suggestedPrice": number,
  "reasoning": "kısa açıklama",
  "expectedImpact": {
    "profitChange": "+%X kar artışı",
    "demandChange": "satış etkisi"
  }
}`;

  return generateStructuredResponse<PriceOptimization>(prompt, schema);
};

// Helper: Generate dashboard insights
export interface DashboardInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  message: string;
  action?: string;
}

export const generateDashboardInsights = async (data: {
  totalProducts: number;
  totalRevenue: number;
  totalProfit: number;
  averageROI: number;
  topProducts: Array<{ name: string; profit: number }>;
  bottomProducts: Array<{ name: string; profit: number }>;
}): Promise<DashboardInsight[]> => {
  const prompt = `
Amazon FBA işletme verileri:

Toplam Ürün: ${data.totalProducts}
Toplam Gelir: $${data.totalRevenue}
Toplam Kar: $${data.totalProfit}
Ortalama ROI: ${data.averageROI}%

En Karlı Ürünler:
${data.topProducts.map(p => `- ${p.name}: $${p.profit}`).join('\n')}

En Düşük Performans:
${data.bottomProducts.map(p => `- ${p.name}: $${p.profit}`).join('\n')}

3-4 akıllı içgörü üret. Her biri şunları içermeli:
- type: success/warning/info/danger
- title: Kısa başlık
- message: Açıklama (1-2 cümle)
- action: Öneri (opsiyonel)

Türkçe ve eylem odaklı ol.
`;

  const schema = `[
  {
    "type": "success",
    "title": "Başlık",
    "message": "Mesaj",
    "action": "Öneri"
  }
]`;

  return generateStructuredResponse<DashboardInsight[]>(prompt, schema);
};

// Helper: Smart restock alert
export interface RestockAlert {
  shouldRestock: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedDaysLeft: number;
  recommendedQuantity: number;
  reasoning: string;
}

export const analyzeRestockNeeds = async (product: {
  name: string;
  current_stock?: number;
  units_sold?: number;
  days_in_stock?: number;
}): Promise<RestockAlert> => {
  const prompt = `
Stok durumu analizi:

Ürün: ${product.name}
Mevcut Stok: ${product.current_stock || 0} birim
Satış Hızı: ${product.units_sold || 0} birim/ay
Stokta Kalma: ${product.days_in_stock || 0} gün

Yeniden stok alınması gerekir mi? Ne zaman ve ne kadar?
`;

  const schema = `{
  "shouldRestock": boolean,
  "urgency": "low|medium|high|critical",
  "estimatedDaysLeft": number,
  "recommendedQuantity": number,
  "reasoning": "kısa açıklama"
}`;

  return generateStructuredResponse<RestockAlert>(prompt, schema);
};

export default {
  generateAIResponse,
  generateStructuredResponse,
  analyzeProductPerformance,
  optimizePrice,
  generateDashboardInsights,
  analyzeRestockNeeds
};

