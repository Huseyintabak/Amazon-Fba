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
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSupabaseStore } from '../stores/useSupabaseStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import WelcomeModal from '../components/WelcomeModal';

const Dashboard: React.FC = () => {
  const { products, shipments, dashboardStats, loadAllData } = useSupabaseStore();
  const { user, profile } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [roiSummary, setROISummary] = useState({ totalProfit: 0, avgROI: 0, topProduct: '' });
  
  const stats = dashboardStats || { total_products: 0, total_shipments: 0, total_shipped_quantity: 0, total_shipping_cost: 0 };

  // Load ROI summary
  useEffect(() => {
    const loadROISummary = async () => {
      try {
        const { data, error } = await supabase
          .from('roi_performance')
          .select('*')
          .order('roi_percentage', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const { data: allData } = await supabase.from('roi_performance').select('net_profit, roi_percentage');
          const totalProfit = allData?.reduce((sum, item) => sum + (item.net_profit || 0), 0) || 0;
          const avgROI = allData && allData.length > 0 
            ? allData.reduce((sum, item) => sum + (item.roi_percentage || 0), 0) / allData.length 
            : 0;
          
          setROISummary({
            totalProfit,
            avgROI,
            topProduct: data[0].product_name || ''
          });
        }
      } catch (error) {
        console.error('Error loading ROI summary:', error);
      }
    };
    
    loadROISummary();
  }, []);
  
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

  // Enhanced Stats with Trends
  const enhancedStats = useMemo(() => {
    const totalProductValue = products.reduce((sum, p) => sum + (p.product_cost || 0), 0);
    const avgProductCost = products.length > 0 ? totalProductValue / products.length : 0;
    
    // Products with profit data
    const profitableProducts = products.filter(p => (p.estimated_profit || 0) > 0).length;
    const avgProfit = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.estimated_profit || 0), 0) / products.length 
      : 0;

    // Last 30 days comparison
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysProducts = products.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
    const last30DaysShipments = shipments.filter(s => new Date(s.shipment_date) >= thirtyDaysAgo).length;

    // Previous 30 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const prev30DaysProducts = products.filter(p => {
      const date = new Date(p.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    const prev30DaysShipments = shipments.filter(s => {
      const date = new Date(s.shipment_date);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    // Calculate trends
    const productTrend = prev30DaysProducts > 0 
      ? ((last30DaysProducts - prev30DaysProducts) / prev30DaysProducts) * 100 
      : (last30DaysProducts > 0 ? 100 : 0);
    const shipmentTrend = prev30DaysShipments > 0 
      ? ((last30DaysShipments - prev30DaysShipments) / prev30DaysShipments) * 100 
      : (last30DaysShipments > 0 ? 100 : 0);

    return {
      totalProductValue,
      avgProductCost,
      profitableProducts,
      avgProfit,
      productTrend,
      shipmentTrend,
      last30DaysShipments
    };
  }, [products, shipments]);

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Show welcome modal for new users
  useEffect(() => {
    if (profile && profile.created_at) {
      const createdAt = new Date(profile.created_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
      
      if (diffMinutes < 5) {
        setShowWelcome(true);
      }
    }
  }, [profile]);

  // Monthly data for charts (last 6 months)
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
        month: month.substring(0, 3),
        shipments: monthShipments.length,
        cost: totalCost,
      };
    });
    
    // Return last 6 months
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(data[monthIndex]);
    }
    
    return last6Months;
  }, [filteredShipments]);

  // Top products by profit
  const topProducts = useMemo(() => {
    return [...products]
      .filter(p => (p.estimated_profit || 0) > 0)
      .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0))
      .slice(0, 5);
  }, [products]);

  // Color palette
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    trend?: number;
    subtitle?: string;
    color: string;
  }> = ({ title, value, icon, trend, subtitle, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-2`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center text-xs font-semibold mt-2 px-2 py-1 rounded-full ${
              trend >= 0 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <span className="mr-1">{trend >= 0 ? '↑' : '↓'}</span>
              {Math.abs(trend).toFixed(1)}% son 30 gün
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} flex items-center justify-center`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        userName={user?.email}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600">Hoş geldiniz! İşte işletmenizin özeti.</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="7days">Son 7 Gün</option>
            <option value="30days">Son 30 Gün</option>
            <option value="90days">Son 90 Gün</option>
            <option value="all">Tüm Zamanlar</option>
          </select>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Ürün"
            value={stats.total_products}
            icon="📦"
            trend={enhancedStats.productTrend}
            color="text-blue-600"
          />
          <StatCard
            title="Toplam Sevkiyat"
            value={stats.total_shipments}
            icon="🚚"
            trend={enhancedStats.shipmentTrend}
            color="text-green-600"
          />
          <StatCard
            title="Net Kar"
            value={`$${roiSummary.totalProfit.toFixed(2)}`}
            icon="💰"
            subtitle="Tüm ürünler"
            color="text-emerald-600"
          />
          <StatCard
            title="Ortalama ROI"
            value={`${roiSummary.avgROI.toFixed(1)}%`}
            icon="📈"
            subtitle={roiSummary.topProduct ? `En iyi: ${roiSummary.topProduct.substring(0, 20)}...` : 'ROI verisi yok'}
            color="text-purple-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Aylık Performans</h3>
              <p className="text-sm text-gray-500 mt-1">Sevkiyat ve maliyet trendi</p>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFF', 
                      border: '1px solid #E5E7EB', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'cost') return [`$${value.toFixed(2)}`, 'Toplam Maliyet'];
                      if (name === 'shipments') return [value, 'Sevkiyat'];
                      return [value, name];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="shipments" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorShipments)" 
                    name="Sevkiyat"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCost)" 
                    name="Maliyet"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products by Profit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">En Karlı Ürünler</h3>
              <p className="text-sm text-gray-500 mt-1">Top 5 yüksek kar marjlı ürünler</p>
            </div>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white border border-gray-100 hover:border-blue-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Marj: {product.profit_margin?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-green-600">
                        ${product.estimated_profit?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">kar</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <span className="text-5xl block mb-3">📊</span>
                  <p className="text-sm">Henüz kar verisi yok</p>
                  <p className="text-xs mt-1">Ürünlerinize maliyet bilgisi ekleyin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Hızlı İşlemler</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/products"
                className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-3xl">📦</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Yeni Ürün</h4>
                  <p className="text-xs text-gray-600">Ürün ekle</p>
                </div>
              </Link>

              <Link
                to="/shipments/new"
                className="group relative bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-3xl">🚚</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Yeni Sevkiyat</h4>
                  <p className="text-xs text-gray-600">Sevkiyat oluştur</p>
                </div>
              </Link>

              <Link
                to="/reports"
                className="group relative bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Raporlar</h4>
                  <p className="text-xs text-gray-600">Analiz görüntüle</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Diğer Metrikler</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💎</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Toplam Değer</p>
                    <p className="text-sm font-bold text-gray-900">${enhancedStats.totalProductValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✓</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Karlı Ürünler</p>
                    <p className="text-sm font-bold text-gray-900">{enhancedStats.profitableProducts}/{stats.total_products}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📈</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ort. Kar</p>
                    <p className="text-sm font-bold text-gray-900">${enhancedStats.avgProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Kargo Maliyeti</p>
                    <p className="text-sm font-bold text-gray-900">${stats.total_shipping_cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
