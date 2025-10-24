import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlanFeatures } from '../lib/featureGating';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  limitType?: 'products' | 'shipments' | 'general';
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  limitType = 'general',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getTitle = () => {
    switch (limitType) {
      case 'products':
        return 'Ürün Limiti Doldu';
      case 'shipments':
        return 'Sevkiyat Limiti Doldu';
      default:
        return 'Pro Özellik';
    }
  };

  const getMessage = () => {
    switch (limitType) {
      case 'products':
        return 'Free planda maksimum 10 ürün oluşturabilirsiniz. Sınırsız ürün için Pro plana yükseltin.';
      case 'shipments':
        return 'Free planda ayda maksimum 5 sevkiyat oluşturabilirsiniz. Sınırsız sevkiyat için Pro plana yükseltin.';
      default:
        return feature
          ? `${feature} özelliği Pro plan ile kullanılabilir. Premium özelliklerimizi keşfedin!`
          : 'Bu özellik Pro plan ile kullanılabilir. Premium özelliklerimizi keşfedin!';
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {getTitle()}
          </h3>
          <p className="text-gray-600">{getMessage()}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            Pro Plan ile:
          </h4>
          <ul className="space-y-2">
            {getPlanFeatures('pro').map((feature, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-bold text-primary">$19</span>
              <span className="text-gray-600 ml-2">/ay</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kapat
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 btn-primary"
          >
            Pro'ya Yükselt
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;

