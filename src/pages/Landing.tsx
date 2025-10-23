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
      icon: '📊',
      title: 'Gelişmiş Raporlar',
      description: 'Ürün ve sevkiyat analizlerinizi görselleştirin. Kârlılık raporları ve trend analizleri.',
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      icon: '📥',
      title: 'CSV İçe/Dışa Aktarma',
      description: 'Toplu ürün yükleyin, verilerinizi Excel ile paylaşın. Veri yönetimi çok kolay.',
      gradient: 'from-green-500 to-green-600',
    },
    {
      icon: '💰',
      title: 'Maliyet Takibi',
      description: 'Ürün maliyetleri, sevkiyat giderleri, FBA ücretleri. Kar marjlarınızı net görün.',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: '🔒',
      title: 'Güvenli ve Hızlı',
      description: 'Verileriniz şifreli ve güvenli sunucularda. 7/24 erişim, her yerden çalışın.',
      gradient: 'from-red-500 to-red-600',
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
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
                <div className="bg-white rounded-2xl shadow-2xl p-2 transform hover:scale-105 transition-all duration-500">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 aspect-video flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <p className="text-gray-600 font-medium">Dashboard Önizleme</p>
                      <p className="text-sm text-gray-500 mt-2">Modern ve kullanıcı dostu arayüz</p>
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

      {/* Features Section */}
      <div id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Her Şey Bir Arada
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

