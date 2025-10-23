import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlanFeatures } from '../lib/featureGating';

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
      isPro: false, // Free plan'da sınırlı
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
      text: 'Amazon FBA Tracker sayesinde envanter yönetimim çok kolaylaştı. Artık hangi ürünün ne durumda olduğunu hemen görebiliyorum.',
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
      {/* Floating Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🚚</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FBA Tracker</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Özellikler</a>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Fiyatlar</Link>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Yorumlar</a>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">Giriş</Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105"
              >
                Başlayın
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern & Eye-catching */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md mb-8 animate-fade-in-down">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">10,000+ Aktif Satıcı</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 animate-fade-in-up">
              Amazon FBA İşinizi
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Kolayca Yönetin
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Ürünlerinizi, sevkiyatlarınızı ve maliyetlerinizi tek platformdan takip edin.
              <br className="hidden md:block" />
              <strong className="text-gray-900">Zaman kazanın, kar marjınızı artırın.</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex justify-center mb-8 animate-fade-in-up animation-delay-200">
              <Link
                to="/signup"
                className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">🚀 Ücretsiz Başlayın</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 animate-fade-in animation-delay-400">
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-lg">✓</span>
                <span>Kredi kartı gerektirmez</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-lg">✓</span>
                <span>10 ürün ücretsiz</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-lg">✓</span>
                <span>30 saniyede kurulum</span>
              </div>
            </div>

            {/* Hero Image / Dashboard Preview */}
            <div className="mt-16 animate-fade-in animation-delay-600">
              <div className="relative mx-auto max-w-5xl">
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none"></div>
                <div className="bg-white rounded-2xl shadow-2xl p-3 transform hover:scale-105 transition-all duration-500">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 overflow-hidden">
                    {/* Dashboard Mockup */}
                    <div className="space-y-4">
                      {/* Top Stats Bar */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { icon: '📦', label: 'Ürünler', value: '156', color: 'from-blue-500 to-blue-600' },
                          { icon: '🚚', label: 'Sevkiyatlar', value: '23', color: 'from-purple-500 to-purple-600' },
                          { icon: '💰', label: 'Toplam Değer', value: '$45K', color: 'from-green-500 to-green-600' },
                          { icon: '📈', label: 'Bu Ay', value: '+12%', color: 'from-pink-500 to-pink-600' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                            <div className={`text-2xl mb-1 bg-gradient-to-br ${stat.color} w-8 h-8 rounded flex items-center justify-center`}>
                              <span className="text-sm">{stat.icon}</span>
                            </div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Charts Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Chart 1 */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-xs font-medium text-gray-600 mb-2">Aylık Trend</div>
                          <div className="flex items-end space-x-1 h-20">
                            {[40, 60, 45, 70, 55, 80, 65, 85].map((height, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                                style={{ height: `${height}%` }}
                              ></div>
                            ))}
                          </div>
                        </div>

                        {/* Chart 2 - Pie Chart */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="text-xs font-medium text-gray-600 mb-2">Kategori Dağılımı</div>
                          <div className="flex items-center justify-center h-20">
                            <div className="relative w-16 h-16">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400"></div>
                              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-gray-700">156</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Items List */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 mb-2">Son Ürünler</div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded flex items-center justify-center text-xs">
                                📦
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="h-2 bg-gray-200 rounded" style={{ width: `${80 - item * 15}%` }}></div>
                              </div>
                              <div className="text-xs text-gray-400">•••</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Overlay Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-900">Gerçek Dashboard Önizleme</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="relative">
          <svg className="w-full h-20" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 8.33333C120 16.6667 240 33.3333 360 41.6667C480 50 600 50 720 41.6667C840 33.3333 960 16.6667 1080 16.6667C1200 16.6667 1320 33.3333 1380 41.6667L1440 50V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Section - HERO */}
      <div className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full mb-6">
              <span className="text-2xl">🤖</span>
              <span className="text-sm font-semibold text-white">Powered by GPT-4o-mini</span>
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">YENİ</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
              AI ile İşletmenizi
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Yeni Seviyeye Taşıyın
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Yapay zeka destekli özelliklerimiz sayesinde rakiplerinizin önüne geçin.
              <br />
              Trend analizi, stok optimizasyonu, pazarlama stratejileri ve daha fazlası!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl hover:bg-white/20 transform hover:-translate-y-2 transition-all duration-300 border border-white/20"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    feature.isPro 
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                      : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                  }`}>
                    {feature.badge}
                  </span>
                </div>

                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/pricing"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
            >
              <span>🚀 AI Özelliklerini Keşfedin</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              Pro plan ile tüm AI özelliklerine sınırsız erişim
            </p>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Temel Özellikler
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Amazon FBA işinizi yönetmek için ihtiyacınız olan tüm araçlar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600">
              Binlerce Amazon satıcısı bize güveniyor
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mr-4 text-2xl">
                    {testimonial.image}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Preview Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Basit ve Şeffaf Fiyatlandırma
            </h2>
            <p className="text-xl text-gray-600">
              İhtiyacınıza göre plan seçin, istediğiniz zaman yükseltin
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-block bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Küçük işletmeler için
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-6xl font-bold">$0</span>
                  <span className="text-gray-600 ml-2 text-xl">/ay</span>
                </div>
                <p className="text-gray-500 text-sm">Sonsuza kadar ücretsiz</p>
              </div>
              <ul className="space-y-4 mb-8">
                {getPlanFeatures('free').map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center py-4 px-6 rounded-xl font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
              >
                Hemen Başla
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                  🔥 EN POPÜLER
                </span>
              </div>
              <div className="text-center mb-6">
                <div className="inline-block bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
                  Büyüyen işletmeler için
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-6xl font-bold text-white">$19</span>
                  <span className="text-blue-100 ml-2 text-xl">/ay</span>
                </div>
                <p className="text-blue-100 text-sm">İstediğiniz zaman iptal edin</p>
              </div>
              <ul className="space-y-4 mb-8">
                {getPlanFeatures('pro').map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-400 mr-3 text-xl flex-shrink-0">✓</span>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center py-4 px-6 rounded-xl font-medium bg-white text-blue-600 hover:bg-gray-50 transition-colors shadow-lg"
              >
                Pro'ya Geçin 🚀
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/pricing"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium group"
            >
              Tüm özellikleri karşılaştır
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Hemen Başlayın, Ücretsiz!
          </h2>
          <p className="text-xl md:text-2xl mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed">
            Amazon FBA işinizi bir sonraki seviyeye taşıyın.
            <br className="hidden md:block" />
            Kurulum sadece 30 saniye, kredi kartı gerektirmez.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-blue-600 bg-white rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2 text-2xl">🚀</span>
              Ücretsiz Hesap Oluştur
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-medium text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Zaten Üyeyim →
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 text-sm opacity-90">
            <div className="flex items-center space-x-2">
              <span className="text-green-300 text-lg">✓</span>
              <span>Kredi kartı gerektirmez</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-300 text-lg">✓</span>
              <span>30 saniye kurulum</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-300 text-lg">✓</span>
              <span>İptal ücreti yok</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🚚</span>
                </div>
                <span className="text-xl font-bold">FBA Tracker</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-sm">
                Amazon FBA satıcıları için modern envanter ve sevkiyat yönetim platformu.
                Ürünlerinizi takip edin, kar marjınızı artırın.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-xl">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-xl">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <span className="text-xl">📧</span>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4 text-white">Ürün</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Özellikler
                  </a>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition-colors">
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-white transition-colors">
                    Müşteri Yorumları
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4 text-white">Şirket</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    İletişim
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="font-bold mb-4 text-white">Destek</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Yardım Merkezi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Kullanım Şartları
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; 2024 Amazon FBA Tracker. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-white transition-colors">Çerezler</a>
              <a href="#" className="hover:text-white transition-colors">Şartlar</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

