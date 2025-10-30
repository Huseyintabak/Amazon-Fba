import React from 'react';
import { Link } from 'react-router-dom';
import { getPlanFeatures } from '../../../lib/featureGating';

const PricingSection: React.FC = () => {
  return (
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
  );
};

export default PricingSection;

