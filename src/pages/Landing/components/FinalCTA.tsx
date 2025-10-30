import React from 'react';
import { Link } from 'react-router-dom';

const FinalCTA: React.FC = () => {
  return (
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
  );
};

export default FinalCTA;

