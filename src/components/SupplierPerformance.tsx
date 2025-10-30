import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PerformanceMetrics {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  avgDeliveryDays: number;
  onTimeDeliveryRate: number;
  rating: number;
  lastOrderDate: string | null;
}

interface SupplierPerformanceProps {
  supplierId?: string;
  compact?: boolean;
}

const SupplierPerformance: React.FC<SupplierPerformanceProps> = ({ supplierId, compact = false }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceMetrics();
  }, [supplierId]);

  const loadPerformanceMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Get purchase orders with supplier info
      let query = supabase
        .from('purchase_orders')
        .select(`
          id,
          supplier_id,
          order_date,
          expected_delivery_date,
          actual_delivery_date,
          status,
          total_amount,
          supplier:suppliers(id, name, rating)
        `);

      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Group by supplier and calculate metrics
      const supplierMap = new Map<string, PerformanceMetrics>();

      orders?.forEach((order: Record<string, unknown>) => {
        const supplierId = order.supplier_id as string;
        const supplier = order.supplier as Record<string, unknown> | undefined;

        if (!supplierMap.has(supplierId)) {
          supplierMap.set(supplierId, {
            supplierId,
            supplierName: (supplier?.name as string) || 'Unknown',
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            totalSpent: 0,
            avgOrderValue: 0,
            avgDeliveryDays: 0,
            onTimeDeliveryRate: 0,
            rating: (supplier?.rating as number) || 0,
            lastOrderDate: null
          });
        }

        const metric = supplierMap.get(supplierId)!;
        metric.totalOrders++;
        metric.totalSpent += (order.total_amount as number) || 0;

        if (order.status === 'received') {
          metric.completedOrders++;
        }
        if (order.status === 'cancelled') {
          metric.cancelledOrders++;
        }

        // Calculate delivery time if completed
        if (order.actual_delivery_date && order.order_date) {
          const orderDate = new Date(order.order_date as string);
          const deliveryDate = new Date(order.actual_delivery_date as string);
          const days = Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
          metric.avgDeliveryDays = (metric.avgDeliveryDays + days) / 2;
        }

        // On-time delivery tracking
        if (order.actual_delivery_date && order.expected_delivery_date) {
          const expectedDate = new Date(order.expected_delivery_date as string);
          const actualDate = new Date(order.actual_delivery_date as string);
          if (actualDate <= expectedDate) {
            metric.onTimeDeliveryRate++;
          }
        }

        // Update last order date
        if (!metric.lastOrderDate || (order.order_date as string) > metric.lastOrderDate) {
          metric.lastOrderDate = order.order_date as string;
        }
      });

      // Calculate averages
      const metricsArray = Array.from(supplierMap.values()).map(m => ({
        ...m,
        avgOrderValue: m.totalOrders > 0 ? m.totalSpent / m.totalOrders : 0,
        onTimeDeliveryRate: m.completedOrders > 0 ? (m.onTimeDeliveryRate / m.completedOrders) * 100 : 0,
        avgDeliveryDays: Math.round(m.avgDeliveryDays)
      }));

      setMetrics(metricsArray);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {supplierId 
          ? 'Bu tedarikçi için henüz sipariş bulunmuyor'
          : 'Henüz sipariş bulunmuyor'}
      </div>
    );
  }

  // Compact view for single supplier
  if (compact && metrics.length === 1) {
    const metric = metrics[0];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-semibold mb-1">Toplam Sipariş</div>
          <div className="text-2xl font-bold text-blue-900">{metric.totalOrders}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xs text-green-600 font-semibold mb-1">Tamamlanan</div>
          <div className="text-2xl font-bold text-green-900">{metric.completedOrders}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-purple-600 font-semibold mb-1">Ort. Teslimat</div>
          <div className="text-2xl font-bold text-purple-900">{metric.avgDeliveryDays} gün</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-xs text-yellow-600 font-semibold mb-1">Zamanında Teslimat</div>
          <div className="text-2xl font-bold text-yellow-900">{metric.onTimeDeliveryRate.toFixed(0)}%</div>
        </div>
      </div>
    );
  }

  // Full comparison view
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Tedarikçi Performans Karşılaştırması</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tedarikçi</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Puan</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Sipariş</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tamamlanan</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Toplam Harcama</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ort. Sipariş</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Ort. Teslimat</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Zamanında %</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {metrics.map((metric) => {
              const completionRate = metric.totalOrders > 0 
                ? (metric.completedOrders / metric.totalOrders) * 100 
                : 0;
              const performanceScore = (
                (metric.rating / 5) * 30 +
                (completionRate / 100) * 30 +
                (metric.onTimeDeliveryRate / 100) * 40
              );

              const getPerformanceColor = (score: number) => {
                if (score >= 80) return 'text-green-600 bg-green-50';
                if (score >= 60) return 'text-yellow-600 bg-yellow-50';
                return 'text-red-600 bg-red-50';
              };

              return (
                <tr key={metric.supplierId} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{metric.supplierName}</div>
                    {metric.lastOrderDate && (
                      <div className="text-xs text-gray-500">
                        Son sipariş: {new Date(metric.lastOrderDate).toLocaleDateString('tr-TR')}
                      </div>
                    )}
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center">
                      <span className="text-yellow-500">{'⭐'.repeat(metric.rating)}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 font-semibold">{metric.totalOrders}</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-green-600 font-semibold">{metric.completedOrders}</span>
                    {metric.cancelledOrders > 0 && (
                      <span className="text-red-600 text-xs ml-1">(-{metric.cancelledOrders})</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    ${metric.totalSpent.toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-700">
                    ${metric.avgOrderValue.toFixed(2)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      metric.avgDeliveryDays <= 7 ? 'bg-green-100 text-green-700' :
                      metric.avgDeliveryDays <= 14 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {metric.avgDeliveryDays || 'N/A'} gün
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      metric.onTimeDeliveryRate >= 90 ? 'bg-green-100 text-green-700' :
                      metric.onTimeDeliveryRate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {metric.onTimeDeliveryRate.toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getPerformanceColor(performanceScore)}`}>
                      {performanceScore.toFixed(0)}/100
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Performance Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance Skoru Hesaplaması:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
          <div>• <strong>Rating (30%):</strong> Supplier rating (1-5 yıldız)</div>
          <div>• <strong>Tamamlanma (30%):</strong> Tamamlanan sipariş oranı</div>
          <div>• <strong>Zamanında Teslimat (40%):</strong> On-time delivery oranı</div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPerformance;

