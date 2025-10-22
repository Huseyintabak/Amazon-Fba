import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSupabaseStore } from '../stores/useSupabaseStore';

const Dashboard: React.FC = () => {
  const { shipments, dashboardStats, loadAllData } = useSupabaseStore();
  const stats = dashboardStats || { total_products: 0, total_shipments: 0, total_shipped_quantity: 0, total_shipping_cost: 0 };
  const recentShipments = shipments.slice(0, 5);

  // Load all data on component mount
  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Monthly data for charts
  const monthlyData = useMemo(() => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const data = months.map((month, index) => {
      const monthShipments = shipments.filter(shipment => {
        const shipmentDate = new Date(shipment.shipment_date);
        return shipmentDate.getMonth() === index;
      });
      
      const totalCost = monthShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0);
      
      return {
        month,
        shipments: monthShipments.length,
        shipping_cost: totalCost
      };
    });
    
    return data;
  }, [shipments]);

  // Carrier distribution data
  const carrierData = useMemo(() => {
    const carriers = shipments.reduce((acc, shipment) => {
      const carrier = shipment.carrier_company;
      if (!acc[carrier]) {
        acc[carrier] = { count: 0, totalCost: 0 };
      }
      acc[carrier].count++;
      acc[carrier].totalCost += shipment.total_shipping_cost;
      return acc;
    }, {} as Record<string, { count: number; totalCost: number }>);

    const totalShipments = shipments.length;

    return Object.entries(carriers).map(([carrier, data]) => ({
      name: carrier,
      count: data.count,
      percentage: totalShipments > 0 ? (data.count / totalShipments) * 100 : 0,
      totalCost: data.totalCost
    }));
  }, [shipments]);

  // Color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    emoji: string;
    color: string;
    bgColor: string;
  }> = ({ title, value, emoji, color, bgColor }) => (
    <div className="card hover-lift">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center`}>
            <span className={`text-2xl ${color}`}>{emoji}</span>
          </div>
        </div>
        <div className="ml-4 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-2xl font-bold text-gray-900">
              {value}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="slide-in">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Amazon FBA sevkiyat takip sistemi genel bakış
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 fade-in">
        <StatCard
          title="Toplam Ürün"
          value={stats.total_products}
          emoji="📦"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Toplam Sevkiyat"
          value={stats.total_shipments}
          emoji="🚚"
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Sevk Edilen Adet"
          value={stats.total_shipped_quantity}
          emoji="📈"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Toplam Kargo Maliyeti"
          value={`$${stats.total_shipping_cost.toFixed(2)}`}
          emoji="💰"
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Shipments */}
        <div className="card">
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Son Sevkiyatlar
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-gray-400">🚚</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {shipment.fba_shipment_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {shipment.carrier_company} • {shipment.shipment_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-gray-900">
                      ${shipment.total_shipping_cost.toFixed(2)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shipment.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shipment.status === 'completed' ? 'Tamamlandı' : 'Taslak'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="border-b border-gray-200 pb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Hızlı İşlemler
            </h3>
          </div>
          <div className="space-y-4">
            <button className="w-full group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    Yeni Ürün Ekle
                  </h4>
                  <p className="text-sm text-gray-500">
                    Sisteme yeni ürün kaydı oluşturun
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors">➕</span>
                </div>
              </div>
            </button>

            <button className="w-full group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <span className="text-2xl">🚚</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                    Yeni Sevkiyat
                  </h4>
                  <p className="text-sm text-gray-500">
                    Yeni sevkiyat oluşturun ve ürün ekleyin
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-gray-400 group-hover:text-green-600 transition-colors">➕</span>
                </div>
              </div>
            </button>

            <button className="w-full group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    Raporları Görüntüle
                  </h4>
                  <p className="text-sm text-gray-500">
                    Detaylı raporları ve analizleri inceleyin
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-gray-400 group-hover:text-purple-600 transition-colors">📊</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
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
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Maliyet']} />
                <Line type="monotone" dataKey="shipping_cost" stroke="#10B981" strokeWidth={2} />
              </LineChart>
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

        {/* Carrier Performance Table */}
        <div className="card">
          <h3 className="card-title mb-4">Kargo Firması Performansı</h3>
          <div className="space-y-3">
            {carrierData.map((carrier, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">{carrier.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{carrier.count} sevkiyat</div>
                  <div className="text-sm text-gray-500">{carrier.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;