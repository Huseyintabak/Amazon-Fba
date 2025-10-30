import React from 'react';
import { Shipment } from '../../../types';

interface ReportSummaryCardsProps {
  filteredShipments: Shipment[];
  carrierCount: number;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  filteredShipments,
  carrierCount
}) => {
  const totalCost = filteredShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0);
  const avgCost = filteredShipments.length > 0 ? totalCost / filteredShipments.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-blue-100">
            <span className="text-2xl">📊</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Toplam Sevkiyat</p>
            <p className="text-2xl font-bold text-gray-900">{filteredShipments.length}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-green-100">
            <span className="text-2xl">💰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Toplam Maliyet</p>
            <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-purple-100">
            <span className="text-2xl">📈</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Ortalama Maliyet</p>
            <p className="text-2xl font-bold text-gray-900">${avgCost.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 rounded-lg bg-orange-100">
            <span className="text-2xl">🚚</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Aktif Kargo Firması</p>
            <p className="text-2xl font-bold text-gray-900">{carrierCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

