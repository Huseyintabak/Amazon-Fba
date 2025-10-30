import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { useAuth } from '../contexts/AuthContext';
import { useUpgradeRedirect } from '../hooks/useUpgradeRedirect';
import { useCache, CACHE_KEYS, CACHE_TTL } from '../lib/cache';
import { productsApi, shipmentsApi } from '../lib/supabaseApi';
import WelcomeModal from '../components/WelcomeModal';
import { StatCard } from './Dashboard/components/StatCard';
import { MonthlyChart } from './Dashboard/components/MonthlyChart';

const Dashboard: React.FC = () => {
  const { products, shipments } = useStore();
  const { user, profile } = useAuth();
  const { redirectToUpgrade, isFreeUser } = useUpgradeRedirect();
  const [showWelcome, setShowWelcome] = useState(false);
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [roiSummary, setROISummary] = useState({ totalProfit: 0, avgROI: 0, topProduct: '' });
  const [isLoading, setIsLoading] = useState(false);

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

  // Filter products by date range
  const filteredProducts = useMemo(() => {
    if (dateRange === 'all') return products;
    
    const now = new Date();
    const daysAgo = {
      '7days': 7,
      '30days': 30,
      '90days': 90
    }[dateRange];
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysAgo);
    
    return products.filter(p => new Date(p.created_at) >= cutoffDate);
  }, [products, dateRange]);

  // Load ROI summary - recalculate when products change or date filter changes
  useEffect(() => {
    const calculateROISummary = () => {
      // Calculate from filtered products
      const totalProfit = filteredProducts.reduce((sum, p) => sum + (p.estimated_profit || 0), 0);
      const avgROI = filteredProducts.length > 0
        ? filteredProducts.reduce((sum, p) => sum + (p.roi_percentage || 0), 0) / filteredProducts.length
        : 0;
      
      const topProduct = [...filteredProducts]
        .filter(p => p.roi_percentage && p.roi_percentage > 0)
        .sort((a, b) => (b.roi_percentage || 0) - (a.roi_percentage || 0))[0];
      
      setROISummary({
        totalProfit,
        avgROI,
        topProduct: topProduct?.name || ''
      });
    };
    
    calculateROISummary();
  }, [filteredProducts]);

  // Enhanced Stats with Trends
  const enhancedStats = useMemo(() => {
    const totalProductValue = filteredProducts.reduce((sum, p) => sum + (p.product_cost || 0), 0);
    const avgProductCost = filteredProducts.length > 0 ? totalProductValue / filteredProducts.length : 0;
    
    // Products with profit data
    const profitableProducts = filteredProducts.filter(p => (p.estimated_profit || 0) > 0).length;
    const avgProfit = filteredProducts.length > 0 
      ? filteredProducts.reduce((sum, p) => sum + (p.estimated_profit || 0), 0) / filteredProducts.length 
      : 0;

    // Calculate period for trend comparison
    const now = new Date();
    const periodDays = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 365;
    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(now.getDate() - periodDays);
    
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(now.getDate() - (periodDays * 2));
    
    // Current period counts
    const currentPeriodProducts = products.filter(p => new Date(p.created_at) >= currentPeriodStart).length;
    const currentPeriodShipments = shipments.filter(s => new Date(s.shipment_date) >= currentPeriodStart).length;
    
    // Previous period counts
    const previousPeriodProducts = products.filter(p => {
      const date = new Date(p.created_at);
      return date >= previousPeriodStart && date < currentPeriodStart;
    }).length;
    const previousPeriodShipments = shipments.filter(s => {
      const date = new Date(s.shipment_date);
      return date >= previousPeriodStart && date < currentPeriodStart;
    }).length;

    // Calculate trends
    const productTrend = previousPeriodProducts > 0 
      ? ((currentPeriodProducts - previousPeriodProducts) / previousPeriodProducts) * 100 
      : (currentPeriodProducts > 0 ? 100 : 0);
    const shipmentTrend = previousPeriodShipments > 0 
      ? ((currentPeriodShipments - previousPeriodShipments) / previousPeriodShipments) * 100 
      : (currentPeriodShipments > 0 ? 100 : 0);

    return {
      totalProductValue,
      avgProductCost,
      profitableProducts,
      avgProfit,
      productTrend,
      shipmentTrend,
      currentPeriodShipments
    };
  }, [filteredProducts, products, shipments, dateRange]);

  // Simple data loading - no complex caching for now
  useEffect(() => {
    setIsLoading(false); // Just set loading to false, data will come from store
  }, []);

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

  // Top products by profit (from filtered products)
  const topProducts = useMemo(() => {
    return [...filteredProducts]
      .filter(p => (p.estimated_profit || 0) > 0)
      .sort((a, b) => (b.estimated_profit || 0) - (a.estimated_profit || 0))
      .slice(0, 5);
  }, [filteredProducts]);

  // Get trend label based on date range
  const getTrendLabel = () => {
    const labels = {
      '7days': 'son 7 gün',
      '30days': 'son 30 gün',
      '90days': 'son 90 gün',
      'all': 'önceki dönem'
    };
    return labels[dateRange];
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

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
            value={filteredProducts.length}
            icon="📦"
            trend={enhancedStats.productTrend}
            trendLabel={getTrendLabel()}
            color="text-blue-600"
          />
          <StatCard
            title="Toplam Sevkiyat"
            value={filteredShipments.length}
            icon="🚚"
            trend={enhancedStats.shipmentTrend}
            trendLabel={getTrendLabel()}
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

        {/* AI Hub Quick Access */}
        <Link 
          to="/ai-hub"
          className="block bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center">
                  AI Hub ile İşletmenizi Analiz Edin
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Yeni</span>
                </h3>
                <p className="text-gray-600 text-sm">
                  Yapay zeka destekli içgörüler, trend analizi, stok optimizasyonu ve pazarlama önerileri
                </p>
              </div>
            </div>
            <div className="text-gray-400">
              <span className="text-2xl">→</span>
            </div>
          </div>
        </Link>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <MonthlyChart data={monthlyData} />

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

              <div
                onClick={() => redirectToUpgrade('Gelişmiş Raporlar')}
                className="group relative bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Raporlar</h4>
                  <p className="text-xs text-gray-600">
                    {isFreeUser ? 'Pro özellik' : 'Analiz görüntüle'}
                  </p>
                  {isFreeUser && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🔒 Pro
                      </span>
                    </div>
                  )}
                </div>
              </div>
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
                    <p className="text-sm font-bold text-gray-900">{enhancedStats.profitableProducts}/{filteredProducts.length}</p>
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
                    <p className="text-sm font-bold text-gray-900">${filteredShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0).toFixed(2)}</p>
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
