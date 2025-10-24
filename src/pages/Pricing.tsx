import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { getPlanFeatures } from '../lib/featureGating';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Pricing: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { planType, loading } = useSubscription();
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First FAQ open by default

  // FAQ animation handler
  const handleFAQToggle = (index: number) => {
    const newOpenFAQ = openFAQ === index ? null : index;
    setOpenFAQ(newOpenFAQ);
    
    // GSAP animation for FAQ content
    const faqContent = document.querySelector(`[data-faq-index="${index}"] .faq-content`);
    if (faqContent) {
      if (newOpenFAQ === index) {
        gsap.fromTo(faqContent, 
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      } else {
        gsap.to(faqContent, 
          { height: 0, opacity: 0, duration: 0.3, ease: "power2.out" }
        );
      }
    }
  };
  
  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null);
  const pricingCardsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

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

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup - hide elements
      gsap.set([headerRef.current, pricingCardsRef.current, faqRef.current, ctaRef.current], {
        opacity: 0,
        y: 50
      });

      // Header animation
      gsap.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      });

      // Pricing cards animation
      gsap.to(pricingCardsRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });

      // FAQ animation with scroll trigger
      gsap.to(faqRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: faqRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        },
        ease: "power3.out"
      });

      // CTA animation with scroll trigger
      gsap.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        },
        ease: "power3.out"
      });

      // Pricing cards hover animations
      const cards = pricingCardsRef.current?.querySelectorAll('.pricing-card');
      cards?.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

    });

    return () => ctx.revert();
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🚚</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FBA Tracker</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Giriş
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

        {/* Main Content with top padding for fixed nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
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
          <div ref={pricingCardsRef} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => {
            const isCurrentPlan = planType === plan.name.toLowerCase();
            const isPro = plan.name === 'Pro';
            
            return (
                <div
                  key={plan.name}
                  className={`pricing-card relative rounded-2xl overflow-hidden ${
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
          <div ref={faqRef} className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {/* FAQ 1 */}
            <div data-faq-index="0" className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => handleFAQToggle(0)}
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
              <div className="faq-content overflow-hidden">
                <p className="px-6 pb-4 text-gray-600">
                  Evet! Free plan ile başlayın, istediğiniz zaman Pro plana geçiş yapın.
                  Kredi kartı bilgisi gerektirmez.
                </p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div data-faq-index="1" className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button
                onClick={() => handleFAQToggle(1)}
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
          <div ref={ctaRef} className="text-center mt-12">
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

