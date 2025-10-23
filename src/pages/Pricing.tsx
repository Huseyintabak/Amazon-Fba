import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { getPlanFeatures } from '../lib/featureGating';

const Pricing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { planType, loading } = useSubscription();
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First FAQ open by default

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'Ücretsiz',
      description: 'İşinizi başlatmak için ideal',
      features: getPlanFeatures('free'),
      cta: 'Ücretsiz Başlayın',
      highlighted: false,
      badge: null,
    },
    {
      name: 'Pro',
      price: 19,
      period: '/ay',
      description: 'AI destekli büyüme için en iyi seçim',
      features: getPlanFeatures('pro'),
      cta: 'Pro\'ya Yükseltin',
      highlighted: true,
      badge: 'EN POPÜLER',
    },
  ];

  const handlePlanSelect = (plan: string) => {
    if (!isAuthenticated) {
      navigate('/signup');
      return;
    }

    if (plan === 'Free') {
      navigate('/');
    } else {
      // Navigate to checkout
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md mb-6">
            <span className="text-2xl">🤖</span>
            <span className="text-sm font-semibold text-gray-700">AI Destekli Amazon FBA Tracker</span>
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">YENİ</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            İhtiyacınıza uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
            <br />
            <span className="text-purple-600 font-semibold">Pro plan ile AI özelliklerine sınırsız erişim!</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = planType === plan.name.toLowerCase();
            const isPro = plan.name === 'Pro';
            
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.highlighted
                    ? 'shadow-2xl transform hover:scale-105 transition-all duration-300'
                    : 'shadow-lg hover:shadow-xl transition-all duration-300'
                }`}
              >
                {/* Gradient Background for Pro */}
                {isPro && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 opacity-95"></div>
                )}
                
                {/* White Background for Free */}
                {!isPro && (
                  <div className="absolute inset-0 bg-white"></div>
                )}

                {/* Content */}
                <div className="relative p-8">
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-6">
                    {plan.badge && (
                      <span className="px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full shadow-lg">
                        {plan.badge}
                      </span>
                    )}
                    {isCurrentPlan && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg ml-auto">
                        Mevcut Plan
                      </span>
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <h3 className={`text-3xl font-bold mb-2 ${isPro ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`mb-4 ${isPro ? 'text-gray-200' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-baseline justify-center">
                      <span className={`text-6xl font-bold ${isPro ? 'text-white' : 'text-gray-900'}`}>
                        ${plan.price}
                      </span>
                      <span className={`text-xl ml-2 ${isPro ? 'text-gray-300' : 'text-gray-600'}`}>
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`mr-3 text-lg flex-shrink-0 ${
                          isPro ? 'text-green-300' : 'text-green-500'
                        }`}>
                          ✓
                        </span>
                        <span className={`text-sm ${isPro ? 'text-white' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={isCurrentPlan && loading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg ${
                      isPro
                        ? 'bg-white text-purple-600 hover:bg-gray-100 hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
                    } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
                  >
                    {isCurrentPlan ? '✓ Mevcut Planınız' : plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section - Accordion */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => setOpenFAQ(openFAQ === 0 ? null : 0)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">
                  Free plan ile başlayabilir miyim?
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                    openFAQ === 0 ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === 0 ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-4 text-gray-600">
                  Evet! Free plan ile başlayın, istediğiniz zaman Pro plana geçiş yapın.
                  Kredi kartı bilgisi gerektirmez.
                </p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => setOpenFAQ(openFAQ === 1 ? null : 1)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">
                  Pro plana ne zaman geçmeliyim?
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                    openFAQ === 1 ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === 1 ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-4 text-gray-600">
                  10'dan fazla ürününüz veya ayda 5'ten fazla sevkiyatınız varsa,
                  Pro plan size daha uygun olacaktır. Ayrıca <strong>AI özelliklerine sınırsız erişim</strong>,
                  CSV import/export, gelişmiş raporlama, ROI tracking ve toplu işlemler gibi
                  premium özelliklere erişim sağlar.
                </p>
              </div>
            </div>

            {/* FAQ 3 - AI Features (Special Design) */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => setOpenFAQ(openFAQ === 2 ? null : 2)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI özellikleri neler?
                </h3>
                <svg
                  className={`w-6 h-6 text-purple-600 transform transition-transform duration-300 flex-shrink-0 ${
                    openFAQ === 2 ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === 2 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4">
                  <p className="text-gray-600 mb-3">
                    Pro plan ile şu AI özelliklerine erişebilirsiniz:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span><strong>AI Chat Asistanı:</strong> Sınırsız mesaj, GPT-4 destekli</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span><strong>Trend Analizi:</strong> Satış tahminleri ve gelecek projeksiyonları</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span><strong>Stok Optimizasyonu:</strong> Akıllı stok önerileri ve uyarıları</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span><strong>Pazarlama Stratejileri:</strong> AI destekli marketing önerileri</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <span><strong>Ürün & Fiyat Analizi:</strong> Performans skoru ve optimal fiyat önerileri</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => setOpenFAQ(openFAQ === 3 ? null : 3)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">
                  İptal politikanız nedir?
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                    openFAQ === 3 ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === 3 ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-4 text-gray-600">
                  İstediğiniz zaman iptal edebilirsiniz. Ödeme döneminin sonuna kadar
                  Pro özelliklere erişiminiz devam eder.
                </p>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => setOpenFAQ(openFAQ === 4 ? null : 4)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 pr-4">
                  Hangi ödeme yöntemlerini kabul ediyorsunuz?
                </h3>
                <svg
                  className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 flex-shrink-0 ${
                    openFAQ === 4 ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === 4 ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-4 text-gray-600">
                  Stripe üzerinden tüm major kredi kartlarını (Visa, Mastercard, Amex)
                  kabul ediyoruz. Ödemeleriniz güvenli şekilde işlenir.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          {!isAuthenticated && (
            <div className="card max-w-2xl mx-auto bg-primary text-white">
              <h3 className="text-2xl font-bold mb-4">
                Hemen Başlayın
              </h3>
              <p className="mb-6">
                Ücretsiz hesap oluşturun ve Amazon FBA işinizi takip etmeye başlayın.
              </p>
              <Link
                to="/signup"
                className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;

