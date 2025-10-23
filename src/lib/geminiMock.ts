// Mock AI responses for testing/fallback
import { DashboardInsight, ProductAnalysis, PriceOptimization, RestockAlert } from './gemini';

export const mockDashboardInsights: DashboardInsight[] = [
  {
    type: 'success',
    title: 'Güçlü Kar Marjı',
    message: 'Ortalama kar marjınız sektör ortalamasının üzerinde. En karlı ürünleriniz portföyünüzün %30\'unu oluşturuyor.',
    action: 'Bu ürünlerin stok seviyesini artırın'
  },
  {
    type: 'warning',
    title: 'Düşük Performanslı Ürünler',
    message: '3 ürününüz son 30 günde düşük kar getirisi gösteriyor. Bu ürünler için fiyat optimizasyonu yapmanız önerilir.',
    action: 'Fiyatları gözden geçirin veya stoktan çıkarmayı düşünün'
  },
  {
    type: 'info',
    title: 'ROI Trendi',
    message: 'Son çeyrekte ROI\'niz %15 arttı. Bu trendin devam etmesi için başarılı stratejilerinizi koruyun.',
    action: 'En iyi performans gösteren ürünlere odaklanın'
  }
];

export const mockProductAnalysis: ProductAnalysis = {
  score: 78,
  insights: [
    'Kar marjı sektör ortalamasının üzerinde (%25)',
    'Satış hızı istikrarlı ve öngörülebilir',
    'ROI beklentileri karşılıyor'
  ],
  recommendations: [
    'Fiyatı %5-10 artırarak kar marjını optimize edebilirsiniz',
    'Stok seviyesini artırarak stockout riskini azaltın',
    'Benzer ürünler için cross-selling stratejisi geliştirin'
  ],
  risks: [
    'Tek tedarikçiye bağımlılık riski var'
  ],
  strengths: [
    'Yüksek kar marjı',
    'Düşük iade oranı',
    'Pozitif müşteri geri bildirimleri'
  ]
};

export const mockPriceOptimization: PriceOptimization = {
  currentPrice: 29.99,
  suggestedPrice: 32.99,
  reasoning: 'Rekabet analizi ve talep esnekliği göz önüne alındığında, fiyatı %10 artırmak karlılığı optimize edebilir. Müşteri segmentiniz fiyat değişikliklerine orta düzeyde duyarlı.',
  expectedImpact: {
    profitChange: '+%15 kar artışı',
    demandChange: 'Tahmini %5 talep azalması (kabul edilebilir)'
  }
};

export const mockRestockAlert: RestockAlert = {
  shouldRestock: true,
  urgency: 'high',
  estimatedDaysLeft: 7,
  recommendedQuantity: 500,
  reasoning: 'Mevcut satış hızınıza göre 7 gün içinde stok tükenecek. Tedarik süresi göz önüne alındığında acil sipariş vermeniz önerilir.'
};

