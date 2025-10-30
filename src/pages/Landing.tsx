import React, { useState, useEffect } from 'react';
import NavigationBar from '@/pages/Landing/components/NavigationBar';
import HeroSection from '@/pages/Landing/components/HeroSection';
import StatsSection from '@/pages/Landing/components/StatsSection';
import AIFeaturesSection from '@/pages/Landing/components/AIFeaturesSection';
import FeaturesSection from '@/pages/Landing/components/FeaturesSection';
import TestimonialsSection from '@/pages/Landing/components/TestimonialsSection';
import PricingSection from '@/pages/Landing/components/PricingSection';
import FinalCTA from '@/pages/Landing/components/FinalCTA';
import Footer from '@/pages/Landing/components/Footer';

const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const aiFeatures = [
    {
      icon: '🤖',
      title: 'AI Chat Asistanı',
      description: 'GPT-4 destekli AI asistanınız her zaman yanınızda. İşletmeniz hakkında soru sorun, anlık öneriler alın.',
      gradient: 'from-purple-500 to-indigo-600',
      badge: 'YENİ',
      isPro: false,
    },
    {
      icon: '📈',
      title: 'AI Trend Analizi',
      description: 'Satış trendlerinizi AI ile analiz edin. Gelecek 3 ay için tahminler alın, işletmenizi büyütün.',
      gradient: 'from-blue-500 to-cyan-600',
      badge: 'PRO',
      isPro: true,
    },
    {
      icon: '📦',
      title: 'AI Stok Optimizasyonu',
      description: 'Akıllı stok önerileri ile stokout risklerini minimize edin. Hangi ürünü ne zaman sipariş etmelisiniz?',
      gradient: 'from-green-500 to-emerald-600',
      badge: 'PRO',
      isPro: true,
    },
    {
      icon: '📣',
      title: 'AI Pazarlama Stratejileri',
      description: 'AI destekli pazarlama önerileri alın. Amazon PPC, sosyal medya, influencer stratejileri ve daha fazlası.',
      gradient: 'from-pink-500 to-rose-600',
      badge: 'PRO',
      isPro: true,
    },
    {
      icon: '🎯',
      title: 'Ürün Performans Analizi',
      description: 'Her ürünü AI ile detaylı analiz edin. Performans skoru, içgörüler, öneriler, riskler ve güçlü yanlar.',
      gradient: 'from-orange-500 to-amber-600',
      badge: 'PRO',
      isPro: true,
    },
    {
      icon: '💰',
      title: 'AI Fiyat Optimizasyonu',
      description: 'Optimal fiyatı AI belirlesin. Kar maksimizasyonu için akıllı fiyat önerileri ve etki analizi.',
      gradient: 'from-yellow-500 to-orange-600',
      badge: 'PRO',
      isPro: true,
    },
  ];

  const features = [
    {
      icon: '📦',
      title: 'Ürün Yönetimi',
      description: 'ASIN, SKU ve barkod bilgilerinizi merkezi bir yerde yönetin. Stok takibi ve ürün detayları her zaman elinizin altında.',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: '🚚',
      title: 'Sevkiyat Takibi',
      description: 'FBA sevkiyatlarınızı detaylı şekilde takip edin. Her paketin durumunu anlık olarak görün.',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: '💹',
      title: 'ROI & Kar Hesaplama',
      description: 'Otomatik kar hesaplamaları, ROI tracking, maliyet analizi. Hangi ürün ne kadar kazandırıyor?',
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: '📊',
      title: 'Gelişmiş Raporlar',
      description: 'Ürün ve sevkiyat analizlerinizi görselleştirin. Kârlılık raporları ve trend analizleri.',
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      icon: '🏭',
      title: 'Tedarikçi Yönetimi',
      description: 'Tedarikçilerinizi organize edin. İletişim bilgileri, ödeme şartları, notlar ve satın alma emirleri.',
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      icon: '⚡',
      title: 'Toplu İşlemler',
      description: 'CSV import/export, toplu düzenleme, toplu silme. Yüzlerce ürünü tek seferde yönetin.',
      gradient: 'from-yellow-500 to-yellow-600',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Aktif Kullanıcı' },
    { value: '1M+', label: 'Takip Edilen Ürün' },
    { value: '50K+', label: 'Aylık Sevkiyat' },
    { value: '99.9%', label: 'Uptime' },
  ];

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      role: 'FBA Satıcısı',
      image: '👨‍💼',
      text: 'Planet FBA Tracker sayesinde envanter yönetimim çok kolaylaştı. Artık hangi ürünün ne durumda olduğunu hemen görebiliyorum.',
      rating: 5,
    },
    {
      name: 'Ayşe Demir',
      role: 'E-ticaret Girişimci',
      image: '👩‍💼',
      text: 'Ücretsiz plan bile yeterli! Ama Pro\'ya geçince CSV import özelliği hayatımı kurtardı. 500 ürünü 5 dakikada yükledim.',
      rating: 5,
    },
    {
      name: 'Mehmet Kaya',
      role: 'Online Satış Uzmanı',
      image: '👨‍💻',
      text: 'Raporlama özelliği muhteşem. Hangi ürünlerin daha çok kar getirdiğini kolayca görebiliyorum.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar scrolled={scrolled} />
      <HeroSection />
      <StatsSection stats={stats} />
      <AIFeaturesSection aiFeatures={aiFeatures} />
      <FeaturesSection features={features} />
      <TestimonialsSection testimonials={testimonials} />
      <PricingSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Landing;
