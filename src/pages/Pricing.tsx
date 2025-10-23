import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { getPlanFeatures } from '../lib/featureGating';

const Pricing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { planType, loading } = useSubscription();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'Ücretsiz',
      description: 'Küçük işletmeler için başlangıç planı',
      features: getPlanFeatures('free'),
      cta: 'Başlayın',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 19,
      period: '/ay',
      description: 'Büyüyen işletmeler için profesyonel plan',
      features: getPlanFeatures('pro'),
      cta: 'Pro\'ya Yükseltin',
      highlighted: true,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Basit ve Şeffaf Fiyatlandırma
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            İhtiyacınıza uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = planType === plan.name.toLowerCase();
            
            return (
              <div
                key={plan.name}
                className={`card relative ${
                  plan.highlighted
                    ? 'border-2 border-primary shadow-xl'
                    : 'border border-gray-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 -mt-3 -mr-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                      Popüler
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 -mt-3 -ml-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                      Mevcut Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-xl text-gray-600 ml-2">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 text-xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.name)}
                  disabled={isCurrentPlan && loading}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    plan.highlighted
                      ? 'btn-primary'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isCurrentPlan ? 'Mevcut Planınız' : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                Free plan ile başlayabilir miyim?
              </h3>
              <p className="text-gray-600">
                Evet! Free plan ile başlayın, istediğiniz zaman Pro plana geçiş yapın.
                Kredi kartı bilgisi gerektirmez.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                Pro plana ne zaman geçmeliyim?
              </h3>
              <p className="text-gray-600">
                10'dan fazla ürününüz veya ayda 5'ten fazla sevkiyatınız varsa,
                Pro plan size daha uygun olacaktır. Ayrıca CSV import/export ve
                gelişmiş raporlama özelliklerine erişim sağlar.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                İptal politikanız nedir?
              </h3>
              <p className="text-gray-600">
                İstediğiniz zaman iptal edebilirsiniz. Ödeme döneminin sonuna kadar
                Pro özelliklere erişiminiz devam eder.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                Hangi ödeme yöntemlerini kabul ediyorsunuz?
              </h3>
              <p className="text-gray-600">
                Stripe üzerinden tüm major kredi kartlarını (Visa, Mastercard, Amex)
                kabul ediyoruz. Ödemeleriniz güvenli şekilde işlenir.
              </p>
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

