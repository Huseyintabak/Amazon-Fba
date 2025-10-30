import React from 'react';
import { Link } from 'react-router-dom';

interface AIFeature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  badge: string;
  isPro: boolean;
}

interface AIFeaturesSectionProps {
  aiFeatures: AIFeature[];
}

const AIFeaturesSection: React.FC<AIFeaturesSectionProps> = ({ aiFeatures }) => {
  return (
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
  );
};

export default AIFeaturesSection;

