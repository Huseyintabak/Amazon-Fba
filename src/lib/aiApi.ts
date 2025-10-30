import { supabase } from './supabase';

export interface AIRequest {
  type: 'price_optimization' | 'supplier_analysis' | 'shipment_optimization' | 'trend_analysis' | 'inventory_analysis' | 'marketing_suggestions' | 'chat';
  prompt: string;
  schema?: string;
  data?: Record<string, unknown>;
}

export interface AIResponse {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
}



export async function callAI(request: AIRequest): Promise<AIResponse> {
  try {
    // Get current session for authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Authentication required');
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        type: request.type,
        prompt: request.prompt,
        schema: request.schema,
        data: request.data
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('AI API Error:', error);
      throw new Error(error.message || 'AI request failed');
    }

    return {
      success: true,
      data: data?.data || data
    };
  } catch (error: unknown) {
    console.error('AI API Call Error:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'AI request failed'
    };
  }
}

// Helper functions for specific AI types
export async function analyzePriceOptimization(productData: Record<string, unknown>[], strategy: string) {
  const prompt = `Amazon FBA fiyat optimizasyonu analizi:

ÜRÜN VERİLERİ:
${productData.map(p => `
${p.name}:
- Kategori: ${p.category}
- Maliyet: $${p.cost}
- Mevcut Fiyat: $${p.currentPrice}
- Kar: $${p.profit}
- ROI: %${p.roi}
- Satış: ${p.sales} adet
- Gelir: $${p.revenue}
`).join('\n')}

STRATEJİ: ${strategy}

GÖREV:
Her ürün için fiyat optimizasyonu önerisi oluştur. ÖNEMLİ: "recommendations" array'inde her ürün için bir obje oluştur.
Türkçe ve Amazon FBA'ya uygun öneriler.`;

  const response = await callAI({
    type: 'price_optimization',
    prompt
  });
  
  console.log('Price optimization response:', JSON.stringify(response, null, 2));
  
  return response;
}

export async function analyzeSupplier(supplierData: Record<string, unknown>[]) {
  const prompt = `Amazon FBA tedarikçi analizi:

TEDARİKÇİ VERİLERİ:
${supplierData.map(s => `
Tedarikçi ID: ${s.id}
İsim: ${s.name}
Şirket: ${s.company}
Ülke: ${s.country}
Toplam Ürün Sayısı: ${s.totalProducts}
Toplam Gelir: $${s.totalRevenue.toFixed(2)}
Ortalama ROI: %${s.avgROI.toFixed(1)}
Ortalama Lead Time: ${s.avgLeadTime} gün
Rating: ${s.rating}/5

En İyi Ürünleri:
${s.products && s.products.length > 0 ? s.products.slice(0, 3).map(p => `  - ${p.name}: Kar: $${p.profit}, ROI: %${p.roi.toFixed(1)}`).join('\n') : '  Henüz ürün yok'}
`).join('\n---\n')}

GÖREV:
Her tedarikçi için detaylı analiz yap. Özellikle:
1. Performans metriklerini değerlendir (Reliability, Quality, Communication, Pricing, Delivery)
2. Güçlü ve zayıf yönleri belirle
3. İyileştirme önerileri sun
4. Risk seviyesini belirle
5. Pazar pozisyonunu değerlendir
6. Gelecek öngörüsü yap
7. Maliyet optimizasyonu öner

Döndürdüğün her analizde "supplierId" alanında YUKARIDAKI ID'LERİ TAM OLARAK kullan.
"supplierName" alanında YUKARIDAKI TEDARİKÇİ İSİMLERİNİ TAM OLARAK kullan.

Türkçe ve Amazon FBA'ya uygun analiz.`;

  return callAI({
    type: 'supplier_analysis',
    prompt
  });
}

export async function optimizeShipments(shipmentData: Record<string, unknown>[]) {
  const prompt = `Amazon FBA sevkiyat optimizasyonu analizi:

SEVKİYAT VERİLERİ:
${shipmentData.map(s => `
${s.fbaId}:
- Tarih: ${s.date}
- Kargo: ${s.carrier}
- Maliyet: $${s.cost}
- Durum: ${s.status}
- Ürün Sayısı: ${s.productCount}
- Toplam Ağırlık: ${s.totalWeight}kg
- Toplam Değer: $${s.totalValue}
`).join('\n')}

GÖREV:
Sevkiyat sürecinizi analiz et ve optimizasyon önerileri oluştur.
Türkçe ve Amazon FBA'ya uygun öneriler.`;

  return callAI({
    type: 'shipment_optimization',
    prompt
  });
}

export async function analyzeTrends(monthlyData: Record<string, unknown>[]) {
  const prompt = `Amazon FBA işletme trend analizi:

Aylık Veriler (son 6 ay):
${monthlyData.map(m => `${m.month}: ${m.shipments} sevkiyat, $${m.revenue.toFixed(2)} gelir`).join('\n')}

GÖREV:
1. Trend yönünü belirle (up/down/stable)
2. Gelecek 3 ay için tahmin yap
3. 3-4 önemli içgörü ver
4. Her ay için tahmini rakam ver

Kısa ve net ol. Türkçe.`;

  return callAI({
    type: 'trend_analysis',
    prompt
  });
}

export async function analyzeInventory(productData: { name: string; currentStock: number; sales: number; profit: number }[]) {
  const prompt = `Amazon FBA stok analizi:

ÖNEMLİ: Aşağıdaki ürün isimlerini TAM OLARAK kullan, "Ürün A", "Ürün B" gibi generic isimler KULLANMA!

ÜRÜN VERİLERİ:
${productData.map(p => `
Ürün İsmi: ${p.name}
- Mevcut Stok: ${p.currentStock} birim
- Satış: ${p.sales} adet
- Kar: $${p.profit}
`).join('\n')}

GÖREV:
Her ürün için stok durumunu analiz et ve acil aksiyon gerektiren ürünler için uyarı oluştur.
Döndürdüğün her uyarıda "product" alanında YUKARIDAKI ÜRÜN İSİMLERİNİ TAM OLARAK kullan.

CRITICAL: "product" alanında "${productData.map(p => p.name).join('", "')}" isimlerinden birini kullan.
"Ürün A", "Ürün B" gibi generic isimler ASLA kullanma!

Türkçe ve Amazon FBA'ya uygun öneriler.`;

  return callAI({
    type: 'inventory_analysis',
    prompt
  });
}

export async function getMarketingSuggestions(productData: Record<string, unknown>[]) {
  const prompt = `Amazon FBA pazarlama stratejileri:

ÖNEMLİ: Aşağıdaki ürün isimlerini TAM OLARAK kullan, "Ürün A", "Ürün B" gibi generic isimler KULLANMA!

ÜRÜN VERİLERİ:
${productData.map(p => `
Ürün İsmi: ${p.name}
- Kar: $${p.profit}
- Satış: ${p.sales} adet
- ROI: %${p.roi || 0}
`).join('\n')}

GÖREV:
Bu ürünler için etkili pazarlama stratejileri öner.
Döndürdüğün her öneride YUKARIDAKI ÜRÜN İSİMLERİNİ referans ver.

Türkçe ve Amazon FBA'ya uygun öneriler.`;

  return callAI({
    type: 'marketing_suggestions',
    prompt
  });
}
