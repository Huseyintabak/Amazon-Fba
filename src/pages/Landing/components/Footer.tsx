import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.svg" alt="Planet FBA Tracker" className="w-full h-full" />
              </div>
              <span className="text-xl font-bold">Planet FBA Tracker</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Planet FBA satıcıları için modern envanter ve sevkiyat yönetim platformu.
              Ürünlerinizi takip edin, kar marjınızı artırın.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <span className="text-xl">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <span className="text-xl">in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <span className="text-xl">📧</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4 text-white">Ürün</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Özellikler
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Fiyatlandırma
                </Link>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  Müşteri Yorumları
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4 text-white">Şirket</h4>
            <ul className="space-y-3 text-gray-400">
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
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-bold mb-4 text-white">Destek</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Yardım Merkezi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Gizlilik Politikası
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Kullanım Şartları
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; 2024 Planet FBA Tracker. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-white transition-colors">Çerezler</a>
            <a href="#" className="hover:text-white transition-colors">Şartlar</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

