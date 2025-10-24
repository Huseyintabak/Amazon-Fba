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
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⚠️</span>
          <div className="text-sm text-yellow-800">
            {showProductWarning && (
              <span>
                {productsRemaining} ürün kaldı ({limits.products} limit)
              </span>
            )}
            {showShipmentWarning && (
              <span>
                {shipmentsRemaining} sevkiyat kaldı ({limits.shipmentsPerMonth} limit)
              </span>
            )}
          </div>
        </div>
        <Link
          to="/pricing"
          className="text-xs font-medium text-yellow-800 hover:text-yellow-900 bg-yellow-100 px-2 py-1 rounded transition-colors"
        >
          Pro'ya Geç →
        </Link>
      </div>
    </div>
  );
};

export default UsageBanner;

