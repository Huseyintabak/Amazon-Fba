import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

interface PremiumBlurProps {
  children: React.ReactNode;
  featureName: string;
  description?: string;
  allowedFeatures?: string[];
}

const PremiumBlur: React.FC<PremiumBlurProps> = ({
  children,
  featureName,
  description,
  allowedFeatures = [
    'products',
    'shipments', 
    'suppliers',
    'dashboard',
    'ai-chat',
    'email-support'
  ]
}) => {
  const navigate = useNavigate();
  const { planType } = useSubscription();

  const isFreeUser = planType === 'free';
  const isAllowedFeature = allowedFeatures.some(feature => 
    featureName.toLowerCase().includes(feature.toLowerCase())
  );

  // If it's a free user and feature is not allowed, show blur
  if (isFreeUser && !isAllowedFeature) {
    return (
      <div className="relative">
        {/* Blurred content */}
        <div className="filter blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay with upgrade prompt */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Pro Özellik
              </h3>
              
              <p className="text-gray-600 mb-6">
                {description || `${featureName} özelliği Pro plan ile kullanılabilir.`}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Free: 10 Ürün, 5 Sevkiyat/Ay</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Pro: Sınırsız + AI Özellikleri</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/pricing')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                🚀 Pro Plana Yükselt
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Dashboard'a Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If it's allowed or Pro user, show normal content
  return <>{children}</>;
};

export default PremiumBlur;
