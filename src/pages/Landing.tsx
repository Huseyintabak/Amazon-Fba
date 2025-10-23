import React from 'react';
import { Link } from 'react-router-dom';
import { getPlanFeatures } from '../lib/featureGating';

const Landing: React.FC = () => {
  const features = [
    {
      icon: '📦',
      title: 'Ürün Yönetimi',
      description: 'ASIN, SKU ve barkod bilgilerinizi merkezi bir yerde yönetin',
    },
    {
      icon: '🚚',
      title: 'Sevkiyat Takibi',
      description: 'FBA sevkiyatlarınızı detaylı şekilde takip edin ve raporlayın',
    },
    {
      icon: '📊',
      title: 'Gelişmiş Raporlar',
      description: 'Ürün ve sevkiyat analizlerinizi görselleştirin',
    },
    {
      icon: '📥',
      title: 'CSV İçe/Dışa Aktarma',
      description: 'Toplu ürün yükleyin veya verilerinizi dışa aktarın',
    },
    {
      icon: '💰',
      title: 'Maliyet Takibi',
      description: 'Ürün maliyetleri ve sevkiyat giderlerinizi kaydedin',
    },
    {
      icon: '🔒',
      title: 'Güvenli ve Hızlı',
      description: 'Verileriniz güvenli sunucularda saklanır',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-5xl">🚚</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Amazon FBA Tracker
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Amazon FBA işinizi kolayca yönetin. Ürünlerinizi, sevkiyatlarınızı ve
              maliyetlerinizi tek bir platformdan takip edin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="btn-primary text-lg px-8 py-4 inline-block"
              >
                Ücretsiz Başlayın
              </Link>
              <Link
                to="/pricing"
                className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-block"
              >
                Fiyatları Görün
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Kredi kartı gerektirmez • 10 ürün ücretsiz • Hemen başlayın
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
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
              className="card text-center hover-lift"
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h2>
          <p className="text-xl text-gray-600">
            İhtiyacınıza göre plan seçin, istediğiniz zaman yükseltin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card border-2 border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-gray-600 ml-2">/ay</span>
              </div>
              <p className="text-gray-600">Küçük işletmeler için</p>
            </div>
            <ul className="space-y-3 mb-8">
              {getPlanFeatures('free').map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="block w-full text-center py-3 px-4 rounded-lg font-medium bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="card border-2 border-primary shadow-xl relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Popüler
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-5xl font-bold text-primary">$19</span>
                <span className="text-gray-600 ml-2">/ay</span>
              </div>
              <p className="text-gray-600">Büyüyen işletmeler için</p>
            </div>
            <ul className="space-y-3 mb-8">
              {getPlanFeatures('pro').map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/signup"
              className="block w-full text-center btn-primary"
            >
              Pro'ya Geç
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/pricing"
            className="text-primary hover:underline font-medium"
          >
            Detaylı fiyatlandırma bilgisi →
          </Link>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Bugün Başlayın
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Amazon FBA işinizi bir sonraki seviyeye taşıyın. Ücretsiz hesap
            oluşturun, kredi kartı gerekmez.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            Ücretsiz Hesap Oluştur
          </Link>
          <p className="mt-6 text-sm opacity-75">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="underline hover:no-underline">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/pricing" className="hover:text-white transition-colors">
                    Fiyatlandırma
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Özellikler
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-gray-400">
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
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Gizlilik
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Şartlar
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Yardım Merkezi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Dokümantasyon
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Amazon FBA Tracker. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

