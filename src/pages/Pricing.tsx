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
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  
  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const pricingCardsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
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
      color: 'from-gray-500 to-gray-600',
      icon: '🚀'
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
      color: 'from-purple-500 via-pink-500 to-red-500',
      icon: '⭐'
    },
  ];

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.fromTo(heroRef.current, 
        { 
          opacity: 0, 
          y: 100,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 1.5,
          ease: "power4.out"
        }
      );

      // Pricing cards animation with stagger
      gsap.fromTo(pricingCardsRef.current?.children || [], 
        { 
          opacity: 0, 
          y: 80,
          rotationY: 15,
          scale: 0.8
        },
        { 
          opacity: 1, 
          y: 0,
          rotationY: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.3,
          delay: 0.5,
          ease: "back.out(1.7)"
        }
      );

      // Features section scroll trigger
      gsap.fromTo(featuresRef.current, 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.95
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          },
          ease: "power3.out"
        }
      );

      // FAQ section scroll trigger
      gsap.fromTo(faqRef.current, 
        { 
          opacity: 0, 
          y: 60
        },
        { 
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
        }
      );

      // CTA section scroll trigger
      gsap.fromTo(ctaRef.current, 
        { 
          opacity: 0, 
          y: 60,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0,
          scale: 1,
          duration: 1,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          },
          ease: "power3.out"
        }
      );

      // Pricing card hover animations
      const cards = pricingCardsRef.current?.querySelectorAll('.pricing-card');
      cards?.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.05,
            rotationY: index === 0 ? -5 : 5,
            duration: 0.4,
            ease: "power2.out"
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            rotationY: 0,
            duration: 0.4,
            ease: "power2.out"
          });
        });
      });

      // Floating elements animation
      gsap.to(".floating-element", {
        y: -20,
        duration: 2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.2
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
      navigate('/checkout');
    }
  };

  const handleFAQToggle = (index: number) => {
    const newOpenFAQ = openFAQ === index ? null : index;
    setOpenFAQ(newOpenFAQ);
    
    // GSAP animation for FAQ content
    const faqContent = document.querySelector(`[data-faq-index="${index}"] .faq-content`);
    if (faqContent) {
      if (newOpenFAQ === index) {
        gsap.fromTo(faqContent, 
          { height: 0, opacity: 0, y: -20 },
          { height: 'auto', opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      } else {
        gsap.to(faqContent, 
          { height: 0, opacity: 0, y: -20, duration: 0.3, ease: "power2.in" }
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="floating-element absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="floating-element absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="floating-element absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
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
                    className="btn-primary"
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
                    className="btn-primary"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full mb-8 shadow-sm border border-gray-200">
            <span className="text-3xl">🤖</span>
            <span className="text-lg font-semibold text-gray-900">AI Destekli Amazon FBA Tracker</span>
            <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">YENİ</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Basit ve
            <br />
            <span className="text-primary">
              Şeffaf Fiyatlandırma
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            İhtiyacınıza uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
            <br />
            <span className="text-primary font-semibold">Pro plan ile AI özelliklerine sınırsız erişim!</span>
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div ref={pricingCardsRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = planType === plan.name.toLowerCase();
            const isPro = plan.name === 'Pro';
            
            return (
              <div
                key={plan.name}
                className={`pricing-card relative rounded-3xl overflow-hidden ${
                  plan.highlighted
                    ? 'shadow-2xl transform hover:scale-105 transition-all duration-300'
                    : 'shadow-xl transform hover:scale-105 transition-all duration-300'
                }`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-90`}></div>
                
                {/* Content */}
                <div className="relative p-8 md:p-12">
                  {/* Badges */}
                  <div className="flex items-center justify-between mb-8">
                    {plan.badge && (
                      <span className="px-4 py-2 bg-yellow-400 text-black text-sm font-bold rounded-full shadow-lg">
                        {plan.badge}
                      </span>
                    )}
                    {isCurrentPlan && (
                      <span className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                        {plan.name === 'Free' ? 'Ücretsiz Plan' : 'Mevcut Plan'}
                      </span>
                    )}
                  </div>

                  {/* Icon & Name */}
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">{plan.icon}</div>
                    <h3 className="text-4xl font-bold text-white mb-4">{plan.name}</h3>
                    <p className="text-white/80 text-lg">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-7xl font-bold text-white">${plan.price}</span>
                      <span className="text-2xl ml-2 text-white/70">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <span className="mr-4 text-2xl text-green-400 flex-shrink-0">✓</span>
                        <span className="text-white/90 text-lg">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.name)}
                    disabled={isCurrentPlan && loading}
                    className={`w-full py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-200 shadow-2xl ${
                      isPro
                        ? 'bg-white text-purple-600 hover:bg-gray-100 hover:shadow-3xl transform hover:scale-105'
                        : 'bg-white/20 backdrop-blur-lg text-white border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transform hover:scale-105'
                    } ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isCurrentPlan ? '✓ Mevcut Planınız' : plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Neden FBA Tracker?
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
            Amazon FBA işinizi büyütmek için ihtiyacınız olan tüm araçlar tek yerde
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🤖', title: 'AI Destekli', desc: 'GPT-4 ile akıllı öneriler' },
              { icon: '📊', title: 'Detaylı Analiz', desc: 'Kapsamlı raporlar ve grafikler' },
              { icon: '⚡', title: 'Hızlı & Güvenli', desc: 'Gerçek zamanlı güncellemeler' }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div ref={faqRef} className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
            Sıkça Sorulan Sorular
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Free plan ile başlayabilir miyim?",
                a: "Evet! Free plan ile başlayın, istediğiniz zaman Pro plana geçiş yapın. Kredi kartı bilgisi gerektirmez."
              },
              {
                q: "Pro plana ne zaman geçmeliyim?",
                a: "10'dan fazla ürününüz veya ayda 5'ten fazla sevkiyatınız varsa, Pro plan size daha uygun olacaktır. Ayrıca AI özelliklerine sınırsız erişim sağlar."
              },
              {
                q: "AI özellikleri neler?",
                a: "Pro plan ile AI Chat Asistanı, Trend Analizi, Stok Optimizasyonu, Pazarlama Stratejileri ve Ürün & Fiyat Analizi özelliklerine erişebilirsiniz."
              },
              {
                q: "İptal politikanız nedir?",
                a: "İstediğiniz zaman iptal edebilirsiniz. Ödeme döneminin sonuna kadar Pro özelliklere erişiminiz devam eder."
              }
            ].map((faq, index) => (
              <div key={index} data-faq-index={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => handleFAQToggle(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-gray-900 pr-4">{faq.q}</h3>
                  <svg
                    className={`w-6 h-6 text-gray-600 transform transition-transform duration-300 flex-shrink-0 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="faq-content overflow-hidden">
                  <p className="px-8 pb-6 text-gray-600 text-lg">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {!isAuthenticated && (
            <div className="bg-primary rounded-3xl p-12 shadow-2xl">
              <h3 className="text-4xl font-bold text-white mb-6">
                Hemen Başlayın
              </h3>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Ücretsiz hesap oluşturun ve Amazon FBA işinizi takip etmeye başlayın.
                AI destekli özelliklerimizi keşfedin!
              </p>
              <Link
                to="/signup"
                className="inline-block bg-white text-primary px-12 py-4 rounded-2xl font-bold text-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Ücretsiz Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;