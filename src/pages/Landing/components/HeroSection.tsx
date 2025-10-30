import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
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
  );
};

export default HeroSection;
