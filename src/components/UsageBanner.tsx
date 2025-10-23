import React from 'react';
import { Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

const UsageBanner: React.FC = () => {
  const {
    planType,
    usage,
    limits,
    getProductsRemaining,
    getShipmentsRemaining,
    getUsagePercentage,
  } = useSubscription();

  if (planType !== 'free' || !usage) return null;

  const productsRemaining = getProductsRemaining();
  const shipmentsRemaining = getShipmentsRemaining();
  const productsPercentage = getUsagePercentage('products');
  const shipmentsPercentage = getUsagePercentage('shipments');

  // Only show banner when usage is > 70%
  const showProductWarning = productsPercentage > 70;
  const showShipmentWarning = shipmentsPercentage > 70;

  if (!showProductWarning && !showShipmentWarning) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Limit Uyarısı
          </h3>
          <div className="mt-2 text-sm text-yellow-700 space-y-1">
            {showProductWarning && (
              <p>
                • {productsRemaining} ürün hakkınız kaldı (Toplam: {limits.products})
              </p>
            )}
            {showShipmentWarning && (
              <p>
                • Bu ay {shipmentsRemaining} sevkiyat hakkınız kaldı (Toplam:{' '}
                {limits.shipmentsPerMonth})
              </p>
            )}
          </div>
          <div className="mt-3">
            <Link
              to="/pricing"
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Pro plana geçerek sınırsız kullanım sağlayın →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageBanner;

