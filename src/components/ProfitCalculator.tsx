import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';

interface ProfitCalculatorProps {
  product: Product;
  onUpdate?: (updates: Partial<Product>) => void;
  compact?: boolean;
}

interface ProfitBreakdown {
  grossRevenue: number;
  referralFee: number;
  fulfillmentFee: number;
  productCost: number;
  advertisingCost: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({ 
  product, 
  onUpdate,
  compact = false 
}) => {
  const [amazonPrice, setAmazonPrice] = useState(product.amazon_price || 0);
  const [productCost, setProductCost] = useState(product.product_cost || 0);
  const [referralFeePercent, setReferralFeePercent] = useState(product.referral_fee_percent || 15);
  const [fulfillmentFee, setFulfillmentFee] = useState(product.fulfillment_fee || 0);
  const [advertisingCost, setAdvertisingCost] = useState(product.advertising_cost || 0);

  // Calculate profit breakdown
  const profit = useMemo((): ProfitBreakdown => {
    const grossRevenue = amazonPrice;
    const referralFee = (amazonPrice * referralFeePercent) / 100;
    const totalCosts = productCost + fulfillmentFee + advertisingCost + referralFee;
    const netProfit = grossRevenue - totalCosts;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      referralFee,
      fulfillmentFee,
      productCost,
      advertisingCost,
      totalCosts,
      netProfit,
      profitMargin,
    };
  }, [amazonPrice, productCost, referralFeePercent, fulfillmentFee, advertisingCost]);

  // Auto-save on change (debounced)
  useEffect(() => {
    if (!onUpdate) return;

    const timer = setTimeout(() => {
      onUpdate({
        amazon_price: amazonPrice,
        product_cost: productCost,
        referral_fee_percent: referralFeePercent,
        fulfillment_fee: fulfillmentFee,
        advertising_cost: advertisingCost,
        estimated_profit: profit.netProfit,
        profit_margin: profit.profitMargin,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [amazonPrice, productCost, referralFeePercent, fulfillmentFee, advertisingCost, profit, onUpdate]);

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900">💰 Kar Hesaplama</h4>
          <span className={`text-2xl font-bold ${profit.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${profit.netProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Kar Marjı:</span>
          <span className={`font-semibold ${profit.profitMargin >= 20 ? 'text-green-600' : profit.profitMargin >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
            {profit.profitMargin.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">💰 Profit Calculator</h3>
        <p className="text-sm text-gray-600">
          Amazon FBA kar hesaplayıcı - tüm maliyetleri girin
        </p>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Amazon Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🏷️ Amazon Satış Fiyatı
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amazonPrice}
              onChange={(e) => setAmazonPrice(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Product Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📦 Ürün Maliyeti
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={productCost}
              onChange={(e) => setProductCost(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Referral Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🏪 Referral Fee (%)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={referralFeePercent}
              onChange={(e) => setReferralFeePercent(parseFloat(e.target.value) || 15)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="15"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Genelde %15</p>
        </div>

        {/* Fulfillment Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🚚 FBA Fulfillment Fee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fulfillmentFee}
              onChange={(e) => setFulfillmentFee(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Advertising Cost */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📊 Reklam Maliyeti (PPC/Birim)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={advertisingCost}
              onChange={(e) => setAdvertisingCost(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Profit Breakdown */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-3">📊 Maliyet Dağılımı</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Satış Fiyatı:</span>
            <span className="font-semibold text-gray-900">${profit.grossRevenue.toFixed(2)}</span>
          </div>
          <div className="border-t border-blue-200 pt-2"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">→ Ürün Maliyeti:</span>
            <span className="text-red-600">-${profit.productCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">→ Referral Fee ({referralFeePercent}%):</span>
            <span className="text-red-600">-${profit.referralFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">→ Fulfillment Fee:</span>
            <span className="text-red-600">-${profit.fulfillmentFee.toFixed(2)}</span>
          </div>
          {profit.advertisingCost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">→ Reklam:</span>
              <span className="text-red-600">-${profit.advertisingCost.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-blue-200 pt-2"></div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Toplam Maliyet:</span>
            <span className="font-semibold text-red-600">${profit.totalCosts.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Net Profit */}
      <div className={`rounded-lg p-4 border-2 ${
        profit.netProfit >= 0 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
          : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-lg font-bold text-gray-900">💰 Net Kar</h4>
          <span className={`text-3xl font-bold ${profit.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${profit.netProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Kar Marjı:</span>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${
              profit.profitMargin >= 20 ? 'text-green-600' : 
              profit.profitMargin >= 10 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {profit.profitMargin.toFixed(1)}%
            </span>
            {profit.profitMargin >= 20 && <span className="text-green-600">🎉 Harika!</span>}
            {profit.profitMargin >= 10 && profit.profitMargin < 20 && <span className="text-yellow-600">👍 İyi</span>}
            {profit.profitMargin < 10 && <span className="text-red-600">⚠️ Düşük</span>}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>💡 İpucu:</strong> Sağlıklı bir ürün için kar marjı en az %15-20 olmalı. 
          Reklam maliyetlerini de hesaba katmayı unutmayın!
        </p>
      </div>
    </div>
  );
};

export default ProfitCalculator;

