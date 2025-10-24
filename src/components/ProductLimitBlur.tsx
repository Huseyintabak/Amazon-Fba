import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

interface ProductLimitBlurProps {
  children: React.ReactNode;
  currentCount: number;
  limit: number;
}

const ProductLimitBlur: React.FC<ProductLimitBlurProps> = ({
  children,
  currentCount,
  limit
}) => {
  const navigate = useNavigate();
  const { planType } = useSubscription();

  const isFreeUser = planType === 'free';
  const isOverLimit = currentCount > limit;

  // If it's a free user and over the limit, show blur for excess items
  if (isFreeUser && isOverLimit) {
    const allChildren = React.Children.toArray(children);
    const visibleItems = allChildren.slice(0, limit); // 1-10 normal
    const blurItems = allChildren.slice(limit, limit + 2); // 11-12 blur
    const modalItem = allChildren.slice(limit + 2, limit + 3); // 13th item becomes modal
    const remainingBlurItems = allChildren.slice(limit + 3); // 14+ blur
    
    return (
      <>
        {/* Show first 'limit' items normally */}
        {visibleItems}

        {/* Show 11th and 12th items as blur */}
        <div className="filter blur-sm pointer-events-none select-none" style={{ minWidth: '1200px' }}>
          {blurItems}
        </div>

        {/* Modal as 13th item */}
        <tr>
          <td colSpan={10} className="relative h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl border border-gray-200">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Ürün Limiti Doldu
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Free planda maksimum <strong>10 ürün</strong> oluşturabilirsiniz. 
                    Şu anda <strong>{currentCount} ürün</strong> var.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span>Free: 10 Ürün, 5 Sevkiyat/Ay</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span>Pro: Sınırsız + AI Özellikleri</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    🚀 Pro Plana Yükselt
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Dashboard'a Dön
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>

        {/* Remaining blurred items */}
        <div className="filter blur-sm pointer-events-none select-none" style={{ minWidth: '1200px' }}>
          {remainingBlurItems}
        </div>
      </>
    );
  }

  // If it's Pro user or under limit, show all items normally
  return <>{children}</>;
};

export default ProductLimitBlur;
