import { PlanLimits } from '../hooks/useSubscription';

export const checkFeatureAccess = (
  planType: 'free' | 'pro',
  feature: keyof PlanLimits
): boolean => {
  const planLimits: Record<'free' | 'pro', PlanLimits> = {
    free: {
      products: 10,
      shipmentsPerMonth: 5,
      csvExport: false,
      advancedReports: false,
      prioritySupport: false,
    },
    pro: {
      products: Infinity,
      shipmentsPerMonth: Infinity,
      csvExport: true,
      advancedReports: true,
      prioritySupport: true,
    },
  };

  return planLimits[planType][feature] as boolean;
};

export const getFeatureLabel = (feature: keyof PlanLimits): string => {
  const labels: Record<keyof PlanLimits, string> = {
    products: 'Ürün Sayısı',
    shipmentsPerMonth: 'Aylık Sevkiyat',
    csvExport: 'CSV İçe/Dışa Aktarma',
    advancedReports: 'Gelişmiş Raporlar',
    prioritySupport: 'Öncelikli Destek',
  };

  return labels[feature];
};

export const getPlanFeatures = (planType: 'free' | 'pro'): string[] => {
  if (planType === 'free') {
    return [
      '📦 10 Ürün',
      '🚚 5 Sevkiyat/Ay',
      '🏭 Tedarikçi Yönetimi',
      '📊 Temel Dashboard',
      '💬 AI Chat Asistanı (10 mesaj/gün)',
      '📧 Email Destek',
    ];
  }

  return [
    '📦 Sınırsız Ürün',
    '🚚 Sınırsız Sevkiyat',
    '🏭 Gelişmiş Tedarikçi & Satın Alma Yönetimi',
    '🤖 Sınırsız AI Chat Asistanı',
    '📈 AI Trend Analizi & Satış Tahminleri',
    '📦 AI Stok Optimizasyonu & Uyarıları',
    '📣 AI Pazarlama Stratejileri',
    '🎯 Ürün Performans Analizi (AI)',
    '💰 Fiyat Optimizasyonu (AI)',
    '💹 ROI & Kar Hesaplayıcı',
    '📊 Gelişmiş Raporlar & Analizler',
    '📥 CSV İçe/Dışa Aktarma',
    '🔍 Gelişmiş Filtreler & Arama',
    '⚡ Toplu İşlemler',
    '🎨 Özel Filtre Presetleri',
    '🏆 Öncelikli Destek',
    '🔌 Amazon SP-API Entegrasyonu (Yakında)',
  ];
};

export const getPlanPrice = (planType: 'free' | 'pro'): number => {
  return planType === 'free' ? 0 : 19;
};

export const getPlanName = (planType: 'free' | 'pro'): string => {
  return planType === 'free' ? 'Free' : 'Pro';
};

