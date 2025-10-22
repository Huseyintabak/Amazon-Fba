import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  // LineChart,
  // Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useSupabaseStore } from '../stores/useSupabaseStore';
// import { Shipment } from '../types';

const Reports: React.FC = () => {
  const { shipments, loadAllData } = useSupabaseStore();
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });
  const [selectedCarrier, setSelectedCarrier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Load all data on component mount
  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Filter shipments based on criteria
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const shipmentDate = new Date(shipment.shipment_date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const dateMatch = shipmentDate >= startDate && shipmentDate <= endDate;
      const carrierMatch = selectedCarrier === 'all' || shipment.carrier_company === selectedCarrier;
      const statusMatch = selectedStatus === 'all' || shipment.status === selectedStatus;
      
      return dateMatch && carrierMatch && statusMatch;
    });
  }, [shipments, dateRange, selectedCarrier, selectedStatus]);

  // Monthly shipment data
  const monthlyData = useMemo(() => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const data = months.map((month, index) => {
      const monthShipments = filteredShipments.filter(shipment => {
        const shipmentDate = new Date(shipment.shipment_date);
        return shipmentDate.getMonth() === index;
      });
      
      const totalCost = monthShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0);
      
      return {
        month,
        shipments: monthShipments.length,
        shipping_cost: totalCost,
        avg_cost: monthShipments.length > 0 ? totalCost / monthShipments.length : 0
      };
    });
    
    return data;
  }, [filteredShipments]);

  // Carrier distribution data
  const carrierData = useMemo(() => {
    const carriers = filteredShipments.reduce((acc, shipment) => {
      const carrier = shipment.carrier_company;
      if (!acc[carrier]) {
        acc[carrier] = { count: 0, totalCost: 0 };
      }
      acc[carrier].count++;
      acc[carrier].totalCost += shipment.total_shipping_cost;
      return acc;
    }, {} as Record<string, { count: number; totalCost: number }>);

    const totalShipments = filteredShipments.length;
    const totalCost = filteredShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0);

    return Object.entries(carriers).map(([carrier, data]) => ({
      name: carrier,
      count: data.count,
      percentage: totalShipments > 0 ? (data.count / totalShipments) * 100 : 0,
      totalCost: data.totalCost,
      avgCost: data.count > 0 ? data.totalCost / data.count : 0
    }));
  }, [filteredShipments]);

  // Status distribution
  const statusData = useMemo(() => {
    const statuses = filteredShipments.reduce((acc, shipment) => {
      const status = shipment.status === 'completed' ? 'Tamamlandı' : 'Taslak';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statuses).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [filteredShipments]);

  // Top products by quantity
  const topProducts = useMemo(() => {
    const productCounts = new Map<string, { name: string; quantity: number; totalCost: number }>();
    
    // For now, we'll use mock data for top products
    // TODO: Implement proper shipment items integration
    const mockTopProducts = [
      { name: 'Wireless Bluetooth Headphones', quantity: 15, totalCost: 389.85 },
      { name: 'Smart Fitness Tracker', quantity: 8, totalCost: 719.92 },
      { name: 'USB-C Charging Cable', quantity: 25, totalCost: 324.75 },
      { name: 'Portable Power Bank', quantity: 12, totalCost: 551.88 },
      { name: 'Bluetooth Speaker', quantity: 6, totalCost: 395.94 }
    ];
    
    mockTopProducts.forEach(product => {
      const key = product.name;
      productCounts.set(key, product);
    });

    return Array.from(productCounts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredShipments]);

  // Color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Raporlar ve Analizler</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sevkiyat verilerinizi analiz edin ve detaylı raporlar görüntüleyin
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="card-title mb-4">Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Bitiş Tarihi</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Kargo Firması</label>
            <select
              value={selectedCarrier}
              onChange={(e) => setSelectedCarrier(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tüm Kargo Firmaları</option>
              <option value="UPS">UPS</option>
              <option value="FedEx">FedEx</option>
              <option value="DHL">DHL</option>
              <option value="Amazon Logistics">Amazon Logistics</option>
            </select>
          </div>
          <div>
            <label className="label">Durum</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="completed">Tamamlandı</option>
              <option value="draft">Taslak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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
              <p className="text-2xl font-bold text-gray-900">
                ${filteredShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0).toFixed(2)}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                ${filteredShipments.length > 0 ? (filteredShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0) / filteredShipments.length).toFixed(2) : '0.00'}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">{carrierData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Shipments Chart */}
        <div className="card">
          <h3 className="card-title mb-4">Aylık Sevkiyat Dağılımı</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shipments" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Cost Trend */}
        <div className="card">
          <h3 className="card-title mb-4">Aylık Kargo Maliyeti Trendi</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Maliyet']} />
                <Area type="monotone" dataKey="shipping_cost" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carrier Distribution */}
        <div className="card">
          <h3 className="card-title mb-4">Kargo Firması Dağılımı</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={carrierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {carrierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="card-title mb-4">Durum Dağılımı</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card">
        <h3 className="card-title mb-4">En Çok Sevk Edilen Ürünler</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Ürün Adı</th>
                <th className="table-header-cell">Toplam Adet</th>
                <th className="table-header-cell">Toplam Maliyet</th>
                <th className="table-header-cell">Ortalama Maliyet</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {topProducts.map((product, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📦</span>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-semibold">{product.quantity}</td>
                  <td className="table-cell font-semibold text-green-600">
                    ${product.totalCost.toFixed(2)}
                  </td>
                  <td className="table-cell">
                    ${(product.totalCost / product.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carrier Performance Table */}
      <div className="card">
        <h3 className="card-title mb-4">Kargo Firması Performansı</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Kargo Firması</th>
                <th className="table-header-cell">Sevkiyat Sayısı</th>
                <th className="table-header-cell">Yüzde</th>
                <th className="table-header-cell">Toplam Maliyet</th>
                <th className="table-header-cell">Ortalama Maliyet</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {carrierData.map((carrier, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="font-medium">{carrier.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-semibold">{carrier.count}</td>
                  <td className="table-cell">{carrier.percentage.toFixed(1)}%</td>
                  <td className="table-cell font-semibold text-green-600">
                    ${carrier.totalCost.toFixed(2)}
                  </td>
                  <td className="table-cell">
                    ${carrier.avgCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
