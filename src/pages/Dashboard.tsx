import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import { useAuth } from '../contexts/AuthContext';
import WelcomeModal from '../components/WelcomeModal';

const Dashboard: React.FC = () => {
  const { products, shipments, dashboardStats, loadAllData } = useSupabaseStore();
  const { user, profile } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  
  const stats = dashboardStats || { total_products: 0, total_shipments: 0, total_shipped_quantity: 0, total_shipping_cost: 0 };
  
  // Recent items for activity feed
  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [products]);

  const recentShipments = useMemo(() => {
    return [...shipments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [shipments]);

  // Filter shipments by date range
  const filteredShipments = useMemo(() => {
    if (dateRange === 'all') return shipments;
    
    const now = new Date();
    const daysAgo = {
      '7days': 7,
      '30days': 30,
      '90days': 90
    }[dateRange];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysAgo);
    
    return shipments.filter(s => new Date(s.shipment_date) >= cutoffDate);
  }, [shipments, dateRange]);

  // Enhanced Stats Calculations
  const enhancedStats = useMemo(() => {
    // Total product value (all product costs combined)
    const totalProductValue = products.reduce((sum, p) => {
      const productCost = p.product_cost || 0;
      return sum + productCost;
    }, 0);

    // Average product cost
    const avgProductCost = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.product_cost || 0), 0) / products.length 
      : 0;

    // Active shipments (status not delivered)
    const activeShipments = shipments.filter(s => 
      s.status && !['delivered', 'completed', 'cancelled'].includes(s.status.toLowerCase())
    ).length;

    // Average shipping cost
    const avgShippingCost = shipments.length > 0
      ? shipments.reduce((sum, s) => sum + (s.total_shipping_cost || 0), 0) / shipments.length
      : 0;

    // This month's shipments
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthShipments = shipments.filter(s => {
      const shipmentDate = new Date(s.shipment_date);
      return shipmentDate.getMonth() === currentMonth && shipmentDate.getFullYear() === currentYear;
    }).length;

    // Last 30 days shipments (trend)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysShipments = shipments.filter(s => {
      const shipmentDate = new Date(s.shipment_date);
      return shipmentDate >= thirtyDaysAgo;
    }).length;

    return {
      totalProductValue,
      avgProductCost,
      activeShipments,
      avgShippingCost,
      thisMonthShipments,
      last30DaysShipments
    };
  }, [products, shipments]);

  // Load all data on component mount
  React.useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Show welcome modal for new users
  useEffect(() => {
    // Check if user just signed up (profile created less than 1 minute ago)
    if (profile && profile.created_at) {
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
      
      // Show welcome if profile is less than 5 minutes old (new user)
      if (diffMinutes < 5) {
        setShowWelcome(true);
      }
    }
  }, [profile]);

  // Monthly data for charts - Enhanced
  const monthlyData = useMemo(() => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    const data = months.map((month, index) => {
      const monthShipments = filteredShipments.filter(shipment => {
        const shipmentDate = new Date(shipment.shipment_date);
        return shipmentDate.getMonth() === index;
      });
      
      const totalCost = monthShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0);
      const avgCost = monthShipments.length > 0 ? totalCost / monthShipments.length : 0;
      
      return {
        month,
        shortMonth: month.substring(0, 3), // Kısa ay adları
        shipments: monthShipments.length,
        shipping_cost: totalCost,
        avg_cost: avgCost
      };
    });
    
    // Only return last 6 months for better visualization
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(data[monthIndex]);
    }
    
    return last6Months;
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

    return Object.entries(carriers).map(([carrier, data]) => ({
      name: carrier,
      count: data.count,
      percentage: totalShipments > 0 ? (data.count / totalShipments) * 100 : 0,
      totalCost: data.totalCost
    }));
  }, [filteredShipments]);

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
    <>
      {/* Welcome Modal for new users */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={user?.email}
      />

      <div className="space-y-8">
        {/* Header with Date Filter */}
        <div className="slide-in flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Amazon FBA sevkiyat takip sistemi genel bakış
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="7days">📅 Son 7 Gün</option>
              <option value="30days">📅 Son 30 Gün</option>
              <option value="90days">📅 Son 90 Gün</option>
              <option value="all">📅 Tüm Zamanlar</option>
            </select>

            {/* Export Button */}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
            >
              <span className="mr-2">📥</span>
              Export
            </button>
          </div>
        </div>

      {/* Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 fade-in">
        {/* Row 1 - Primary Metrics */}
        <StatCard
          title="Toplam Ürün"
          value={stats.total_products}
          emoji="📦"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Ürün Değeri"
          value={`$${enhancedStats.totalProductValue.toFixed(2)}`}
          emoji="💎"
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Ortalama Maliyet"
          value={`$${enhancedStats.avgProductCost.toFixed(2)}`}
          emoji="💵"
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Aktif Sevkiyat"
          value={enhancedStats.activeShipments}
          emoji="🚀"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />

        {/* Row 2 - Secondary Metrics */}
        <StatCard
          title="Toplam Sevkiyat"
          value={stats.total_shipments}
          emoji="🚚"
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          title="Bu Ay Sevkiyat"
          value={enhancedStats.thisMonthShipments}
          emoji="📅"
          color="text-pink-600"
          bgColor="bg-pink-50"
        />
        <StatCard
          title="Toplam Kargo Maliyeti"
          value={`$${stats.total_shipping_cost.toFixed(2)}`}
          emoji="💰"
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          title="Sevk Edilen Adet"
          value={stats.total_shipped_quantity}
          emoji="📈"
          color="text-teal-600"
          bgColor="bg-teal-50"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Products */}
        <div className="card">
          <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Son Eklenen Ürünler</h3>
              <p className="text-sm text-gray-500 mt-1">En son eklediğiniz ürünler</p>
            </div>
            <Link to="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Tümü →
            </Link>
          </div>
          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ASIN: {product.asin}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {product.product_cost && (
                        <p className="text-sm font-semibold text-gray-900">
                          ${product.product_cost.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(product.created_at).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <span className="text-3xl block mb-2">📦</span>
                <p className="text-sm">Henüz ürün eklemediniz</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="card">
          <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Son Sevkiyatlar</h3>
              <p className="text-sm text-gray-500 mt-1">En son oluşturduğunuz sevkiyatlar</p>
            </div>
            <Link to="/shipments" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Tümü →
            </Link>
          </div>
          <div className="space-y-3">
            {recentShipments.length > 0 ? (
              recentShipments.map((shipment) => (
                <Link
                  key={shipment.id}
                  to={`/shipments/${shipment.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🚚</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {shipment.fba_shipment_id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {shipment.carrier_company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-900">
                        ${shipment.total_shipping_cost.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(shipment.shipment_date).toLocaleDateString('tr-TR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      shipment.status === 'completed' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {shipment.status === 'completed' ? '✓ Tamamlandı' : '⏳ Taslak'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400">
                <span className="text-3xl block mb-2">🚚</span>
                <p className="text-sm">Henüz sevkiyat oluşturmadınız</p>
              </div>
            )}
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
            <Link
              to="/products"
              className="w-full group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block"
            >
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
            </Link>

            <Link
              to="/shipments/new"
              className="w-full group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 block"
            >
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
            </Link>

            <Link
              to="/reports"
              className="w-full group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 block"
            >
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
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Section - Enhanced */}
      <div className="space-y-8">
        {/* Top Row - Dual Chart (Shipments & Cost Combined) */}
        <div className="card">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Aylık Performans Özeti</h3>
            <p className="text-sm text-gray-500 mt-1">Son 6 ayın sevkiyat ve maliyet trendi</p>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="shortMonth" 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#9CA3AF' }}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#9CA3AF' }}
                  label={{ value: 'Sevkiyat Sayısı', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#9CA3AF' }}
                  label={{ value: 'Maliyet ($)', angle: 90, position: 'insideRight', fill: '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'shipping_cost') return [`$${value.toFixed(2)}`, 'Toplam Maliyet'];
                    if (name === 'shipments') return [value, 'Sevkiyat Sayısı'];
                    if (name === 'quantity') return [value, 'Toplam Adet'];
                    return [value, name];
                  }}
                />
                <Bar yAxisId="left" dataKey="shipments" fill="#3B82F6" name="Sevkiyat Sayısı" radius={[8, 8, 0, 0]} />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="shipping_cost" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Toplam Maliyet"
                  dot={{ fill: '#10B981', r: 5 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row - Carrier Distribution */}
        <div className="grid grid-cols-1 gap-8">
          {/* Carrier Distribution - Combined */}
          <div className="card">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900">Kargo Firması Performansı</h3>
              <p className="text-sm text-gray-500 mt-1">Firma bazlı dağılım ve toplam maliyetler</p>
            </div>
            
            {carrierData.length > 0 ? (
              <>
                {/* Pie Chart */}
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={carrierData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {carrierData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                        formatter={(value: any, _name: string, props: any) => [
                          `${value} sevkiyat - $${props.payload.totalCost.toFixed(2)}`,
                          props.payload.name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Performance Table */}
                <div className="space-y-2">
                  {carrierData.map((carrier, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-gray-900">{carrier.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">{carrier.count} sevkiyat</span>
                        <span className="text-gray-500">{carrier.percentage.toFixed(1)}%</span>
                        <span className="font-bold text-gray-900">${carrier.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <span className="text-4xl block mb-2">📦</span>
                  <p>Henüz kargo verisi yok</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;