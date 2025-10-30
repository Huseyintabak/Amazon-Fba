import React, { useState } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: `Hoş Geldiniz${userName ? `, ${userName.split('@')[0]}` : ''}! 👋`,
      description: 'Planet FBA Tracker\'a hoş geldiniz! Ürün ve sevkiyat takibinizi kolaylaştırmak için buradayız.',
      icon: '🚀',
      features: [
        'Sınırsız ürün takibi',
        'Detaylı sevkiyat yönetimi',
        'Gelişmiş raporlama',
        'CSV import/export'
      ]
    },
    {
      title: 'Hızlı Başlangıç 📦',
      description: 'İlk ürününüzü ekleyerek başlayın!',
      icon: '📦',
      features: [
        '1. Ürünler sayfasına gidin',
        '2. "Yeni Ürün Ekle" butonuna tıklayın',
        '3. Ürün bilgilerini doldurun',
        '4. Kaydet - Hazırsınız!'
      ]
    },
    {
      title: 'Free Plan Avantajları 🎁',
      description: 'Free plan ile başlayın, ihtiyaç duyduğunuzda yükseltin!',
      icon: '🎁',
      features: [
        '✅ 10 ürün',
        '✅ Ayda 5 sevkiyat',
        '✅ Temel raporlar',
        '⭐ Pro: Sınırsız her şey!'
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="Close"
        >
          ×
        </button>

        {/* Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{currentStepData.icon}</div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {currentStepData.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          {currentStepData.description}
        </p>

        {/* Features */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <ul className="space-y-2">
            {currentStepData.features.map((feature, index) => (
              <li key={index} className="flex items-start text-gray-700">
                <span className="mr-2 mt-1">
                  {feature.startsWith('✅') || feature.startsWith('⭐') ? '' : '•'}
                </span>
                <span className="flex-1">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Geri
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastStep ? 'Başlayalım! 🚀' : 'Devam'}
          </button>
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Atla
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WelcomeModal;

