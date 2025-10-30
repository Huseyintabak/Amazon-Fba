import React from 'react';
import { Link } from 'react-router-dom';

interface NavigationBarProps {
  scrolled: boolean;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ scrolled }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.svg" alt="Planet FBA Tracker" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-gray-900">Planet FBA Tracker</span>
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
  );
};

export default NavigationBar;

