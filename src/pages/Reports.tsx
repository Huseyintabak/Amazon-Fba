import React, { useState, useMemo, useEffect } from 'react';
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
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { useStore } from '../stores/useStore';
import { supabase } from '../lib/supabase';
import { CostBreakdown, ROIPerformance, ShipmentItem } from '../types';
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
import PremiumBlur from '../components/PremiumBlur';
import { ReportSummaryCards } from './Reports/components/ReportSummaryCards';
import { ReportFilters } from './Reports/components/ReportFilters';
import { MonthlyShipmentsChart } from './Reports/components/MonthlyShipmentsChart';
import { MonthlyCostTrendChart } from './Reports/components/MonthlyCostTrendChart';
import { CarrierDistributionChart } from './Reports/components/CarrierDistributionChart';
import { StatusDistributionChart } from './Reports/components/StatusDistributionChart';

const Reports: React.FC = () => {
  const { shipments, products, loadAllData } = useStore();
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'shipments' | 'roi'>('shipments');
  
  // Initialize with last 90 days
  const getDefaultDateRange = (): DateRange => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 89);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      preset: 'last90days'
    };
  };
  
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [selectedCarrier, setSelectedCarrier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // ROI Data
  const [costBreakdownData, setCostBreakdownData] = useState<CostBreakdown[]>([]);
  const [roiPerformanceData, setROIPerformanceData] = useState<ROIPerformance[]>([]);
  const [isLoadingROI, setIsLoadingROI] = useState(false);

  // Load all data on component mount
  React.useEffect(() => {
    loadAllData();
    loadMaterializedData();
    loadShipmentItems();
  }, [loadAllData]);

  // Load shipment items
  const loadShipmentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shipment_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Loaded shipment items:', data?.length || 0);
      setShipmentItems(data || []);
    } catch (error) {
      console.error('Error loading shipment items:', error);
    }
  };

  // Load data from materialized views
  const loadMaterializedData = async () => {
    try {
      // Load product performance data
      const { data: productData, error: productError } = await supabase
        .from('mv_product_performance')
        .select('*')
        .order('roi_percentage', { ascending: false });

      if (productError) throw productError;

      // Load supplier performance data
      const { data: supplierData, error: supplierError } = await supabase
        .from('mv_supplier_performance')
        .select('*')
        .order('avg_roi', { ascending: false });

      if (supplierError) throw supplierError;

      console.log('Materialized data loaded:', { productData, supplierData });
    } catch (error) {
      console.error('Error loading materialized data:', error);
    }
  };

  // Load ROI data when tab changes
  useEffect(() => {
    if (activeTab === 'roi') {
      loadROIData();
    }
  }, [activeTab]);

  const loadROIData = async () => {
    try {
      setIsLoadingROI(true);
      
      // Load cost breakdown
      const { data: costData, error: costError } = await supabase
        .from('cost_breakdown')
        .select('*')
        .order('total_cost', { ascending: false });
      
      if (costError) throw costError;
      setCostBreakdownData(costData || []);
      
      // Load ROI performance
      const { data: roiData, error: roiError } = await supabase
        .from('roi_performance')
        .select('*')
        .order('roi_percentage', { ascending: false });
      
      if (roiError) throw roiError;
      setROIPerformanceData(roiData || []);
    } catch (error) {
      console.error('Error loading ROI data:', error);
    } finally {
      setIsLoadingROI(false);
    }
  };

  // Filter shipments based on criteria
  const filteredShipments = useMemo(() => {
    return shipments.filter(shipment => {
      const shipmentDate = new Date(shipment.shipment_date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      
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
    // const totalCost = filteredShipments.reduce((sum, s) => sum + s.total_shipping_cost, 0);

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
    
    // Filter shipment items by filtered shipments
    const filteredShipmentIds = new Set(filteredShipments.map(s => s.id));
    const relevantItems = shipmentItems.filter(item => filteredShipmentIds.has(item.shipment_id));
    
    // Create a map of shipment_id to total shipping cost
    const shipmentCostMap = new Map<string, number>();
    filteredShipments.forEach(shipment => {
      shipmentCostMap.set(shipment.id, shipment.total_shipping_cost || 0);
    });
    
    // Aggregate by product
    relevantItems.forEach(item => {
      const productId = item.product_id;
      const product = products.find(p => p.id === productId);
      const productName = product?.name || 'Unknown Product';
      
      // Get unit shipping cost from item, or calculate from shipment total
      let unitCost = item.unit_shipping_cost;
      
      // If unit cost is 0, distribute shipment total cost proportionally
      if (unitCost === 0 || unitCost === null) {
        const shipmentTotalCost = shipmentCostMap.get(item.shipment_id) || 0;
        const shipmentItemsTotal = relevantItems
          .filter(i => i.shipment_id === item.shipment_id)
          .reduce((sum, i) => sum + i.quantity, 0);
        
        if (shipmentItemsTotal > 0) {
          unitCost = shipmentTotalCost / shipmentItemsTotal;
        }
      }
      
      const itemCost = unitCost * item.quantity;
      
      if (productCounts.has(productName)) {
        const existing = productCounts.get(productName)!;
        existing.quantity += item.quantity;
        existing.totalCost += itemCost;
      } else {
        productCounts.set(productName, {
          name: productName,
          quantity: item.quantity,
          totalCost: itemCost
        });
      }
    });

    return Array.from(productCounts.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredShipments, shipmentItems, products]);

  // Color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // ROI Metrics
  const roiMetrics = useMemo(() => {
    if (roiPerformanceData.length === 0) return {
      totalInvestment: 0,
      totalRevenue: 0,
      totalProfit: 0,
      avgROI: 0,
      positiveROICount: 0,
      totalProducts: 0
    };

    const totalInvestment = roiPerformanceData.reduce((sum, item) => sum + (item.initial_investment || 0), 0);
    const totalRevenue = roiPerformanceData.reduce((sum, item) => sum + (item.revenue_generated || 0), 0);
    const totalCosts = roiPerformanceData.reduce((sum, item) => sum + (item.total_costs || 0), 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgROI = roiPerformanceData.reduce((sum, item) => sum + (item.roi_percentage || 0), 0) / roiPerformanceData.length;
    const positiveROICount = roiPerformanceData.filter(item => (item.roi_percentage || 0) > 0).length;

    return {
      totalInvestment,
      totalRevenue,
      totalProfit,
      avgROI,
      positiveROICount,
      totalProducts: roiPerformanceData.length
    };
  }, [roiPerformanceData]);

  // Cost breakdown chart data
  const costBreakdownChartData = useMemo(() => {
    return costBreakdownData.slice(0, 10).map(item => ({
      name: item.product_name?.substring(0, 20) + '...' || 'Unknown',
      'Ürün Maliyeti': item.product_cost_percentage || 0,
      'FBA Ücreti': item.fulfillment_cost_percentage || 0,
      'Reklam': item.advertising_cost_percentage || 0,
      'Referans': item.referral_fee_percentage || 0,
    }));
  }, [costBreakdownData]);

  return (
    <PremiumBlur 
      featureName="Gelişmiş Raporlar" 
      description="Detaylı analizler ve ROI raporları Pro plan ile kullanılabilir."
      allowedFeatures={['dashboard']}
    >
      <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Raporlar ve Analizler</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sevkiyat verilerinizi analiz edin ve detaylı raporlar görüntüleyin
          </p>
        </div>
        <Link
          to="/scheduled-reports"
          className="btn-primary flex items-center space-x-2"
        >
          <span>📧</span>
          <span>Planlanmış Raporlar</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'shipments'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🚚 Sevkiyat Raporları
        </button>
        <button
          onClick={() => setActiveTab('roi')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'roi'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          💰 ROI & Kar/Zarar Analizi
        </button>
      </div>

      {/* Shipments Tab Content */}
      {activeTab === 'shipments' && (
        <>
          <ReportFilters
            dateRange={dateRange}
            selectedCarrier={selectedCarrier}
            selectedStatus={selectedStatus}
            onDateRangeChange={setDateRange}
            onCarrierChange={setSelectedCarrier}
            onStatusChange={setSelectedStatus}
          />

          <ReportSummaryCards
            filteredShipments={filteredShipments}
            carrierCount={carrierData.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MonthlyShipmentsChart data={monthlyData} />
            <MonthlyCostTrendChart data={monthlyData} />
            <CarrierDistributionChart data={carrierData} />
            <StatusDistributionChart data={statusData} />
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
        </>
      )}

      {/* ROI & P/L Tab Content */}
      {activeTab === 'roi' && (
        <>
          {isLoadingROI ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* ROI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-700">Toplam Yatırım</p>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                      ${roiMetrics.totalInvestment.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-green-700">Toplam Gelir</p>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                      ${roiMetrics.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-emerald-700">Net Kar</p>
                    <p className={`text-2xl font-bold mt-2 ${roiMetrics.totalProfit >= 0 ? 'text-emerald-900' : 'text-red-700'}`}>
                      ${roiMetrics.totalProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-purple-700">Ortalama ROI</p>
                    <p className={`text-2xl font-bold mt-2 ${roiMetrics.avgROI >= 0 ? 'text-purple-900' : 'text-red-700'}`}>
                      {roiMetrics.avgROI.toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-orange-700">Karlı Ürünler</p>
                    <p className="text-2xl font-bold text-orange-900 mt-2">
                      {roiMetrics.positiveROICount}
                    </p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                  <div className="text-center">
                    <p className="text-sm font-medium text-pink-700">Toplam Ürün</p>
                    <p className="text-2xl font-bold text-pink-900 mt-2">
                      {roiMetrics.totalProducts}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cost Breakdown Chart */}
                <div className="card">
                  <h3 className="card-title mb-4">📊 Maliyet Dağılımı (Top 10)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={costBreakdownChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis label={{ value: 'Yüzde (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="Ürün Maliyeti" stackId="a" fill="#3B82F6" />
                        <Bar dataKey="FBA Ücreti" stackId="a" fill="#10B981" />
                        <Bar dataKey="Reklam" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="Referans" stackId="a" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 mr-2"></div>Ürün Maliyeti</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-600 mr-2"></div>FBA Ücreti</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-orange-600 mr-2"></div>Reklam</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-600 mr-2"></div>Referans</div>
                  </div>
                </div>

                {/* ROI Performance Chart */}
                <div className="card">
                  <h3 className="card-title mb-4">📈 ROI Performansı (Top 10)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={roiPerformanceData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="product_name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          tickFormatter={(value) => value?.substring(0, 15) + '...' || ''}
                        />
                        <YAxis label={{ value: 'ROI %', angle: -90, position: 'insideLeft' }} />
                        <Tooltip 
                          formatter={(value: number | string) => [`${value}%`, 'ROI']}
                          labelFormatter={(label) => `Ürün: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="roi_percentage" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ fill: '#8B5CF6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Profit vs Revenue */}
                <div className="card">
                  <h3 className="card-title mb-4">💰 Gelir vs. Kar (Top 10)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={roiPerformanceData.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="product_name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          tickFormatter={(value) => value?.substring(0, 15) + '...' || ''}
                        />
                        <YAxis label={{ value: 'Tutar ($)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: number | string) => [`$${value}`, '']} />
                        <Bar dataKey="revenue_generated" fill="#10B981" name="Gelir" />
                        <Bar dataKey="net_profit" fill="#3B82F6" name="Net Kar" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-600 mr-2"></div>Gelir</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 mr-2"></div>Net Kar</div>
                  </div>
                </div>

                {/* ROI Distribution Pie */}
                <div className="card">
                  <h3 className="card-title mb-4">🎯 ROI Dağılımı</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Yüksek ROI (>50%)', value: roiPerformanceData.filter(p => (p.roi_percentage || 0) > 50).length },
                            { name: 'Orta ROI (20-50%)', value: roiPerformanceData.filter(p => (p.roi_percentage || 0) >= 20 && (p.roi_percentage || 0) <= 50).length },
                            { name: 'Düşük ROI (0-20%)', value: roiPerformanceData.filter(p => (p.roi_percentage || 0) >= 0 && (p.roi_percentage || 0) < 20).length },
                            { name: 'Negatif ROI', value: roiPerformanceData.filter(p => (p.roi_percentage || 0) < 0).length },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#10B981" />
                          <Cell fill="#3B82F6" />
                          <Cell fill="#F59E0B" />
                          <Cell fill="#EF4444" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* ROI Performance Table */}
              <div className="card">
                <h3 className="card-title mb-4">📊 Detaylı ROI Performansı</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Ürün</th>
                        <th className="table-header-cell">Tedarikçi</th>
                        <th className="table-header-cell">Yatırım</th>
                        <th className="table-header-cell">Satılan</th>
                        <th className="table-header-cell">Gelir</th>
                        <th className="table-header-cell">Maliyet</th>
                        <th className="table-header-cell">Net Kar</th>
                        <th className="table-header-cell">ROI %</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {roiPerformanceData.map((item, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">
                            <div className="font-medium text-gray-900 max-w-xs truncate">
                              {item.product_name}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              {item.supplier_name && (
                                <span className="text-sm font-medium">{item.supplier_name}</span>
                              )}
                              {item.supplier_country && (
                                <span className="text-xs text-gray-500">{item.supplier_country}</span>
                              )}
                              {!item.supplier_name && <span className="text-xs text-gray-400">-</span>}
                            </div>
                          </td>
                          <td className="table-cell text-blue-600 font-semibold">
                            ${item.initial_investment?.toFixed(2) || '0.00'}
                          </td>
                          <td className="table-cell font-semibold">
                            {item.units_sold || 0}
                          </td>
                          <td className="table-cell text-green-600 font-semibold">
                            ${item.revenue_generated?.toFixed(2) || '0.00'}
                          </td>
                          <td className="table-cell text-orange-600 font-semibold">
                            ${item.total_costs?.toFixed(2) || '0.00'}
                          </td>
                          <td className={`table-cell font-bold ${(item.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${item.net_profit?.toFixed(2) || '0.00'}
                          </td>
                          <td className="table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              (item.roi_percentage || 0) > 50 ? 'bg-green-100 text-green-800' :
                              (item.roi_percentage || 0) >= 20 ? 'bg-blue-100 text-blue-800' :
                              (item.roi_percentage || 0) >= 0 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.roi_percentage?.toFixed(1) || '0.0'}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {roiPerformanceData.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-6xl text-gray-400">📊</span>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">ROI verisi bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ürünlerinize ROI tracking bilgilerini ekleyin.
                    </p>
                  </div>
                )}
              </div>

              {/* Cost Breakdown Table */}
              <div className="card">
                <h3 className="card-title mb-4">💸 Maliyet Detayları</h3>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Ürün</th>
                        <th className="table-header-cell">Ürün Maliyeti</th>
                        <th className="table-header-cell">FBA Ücreti</th>
                        <th className="table-header-cell">Reklam</th>
                        <th className="table-header-cell">Referans Ücreti</th>
                        <th className="table-header-cell">Toplam Maliyet</th>
                        <th className="table-header-cell">Tahmini Kar</th>
                        <th className="table-header-cell">Kar Marjı</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {costBreakdownData.map((item, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">
                            <div className="font-medium text-gray-900 max-w-xs truncate">
                              {item.product_name}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              <span className="font-semibold">${item.product_cost?.toFixed(2) || '0.00'}</span>
                              <span className="text-xs text-gray-500">{item.product_cost_percentage?.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              <span className="font-semibold">${item.fulfillment_fee?.toFixed(2) || '0.00'}</span>
                              <span className="text-xs text-gray-500">{item.fulfillment_cost_percentage?.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              <span className="font-semibold">${item.advertising_cost?.toFixed(2) || '0.00'}</span>
                              <span className="text-xs text-gray-500">{item.advertising_cost_percentage?.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex flex-col">
                              <span className="font-semibold">${item.referral_fee?.toFixed(2) || '0.00'}</span>
                              <span className="text-xs text-gray-500">{item.referral_fee_percentage?.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="table-cell text-orange-600 font-bold">
                            ${item.total_cost?.toFixed(2) || '0.00'}
                          </td>
                          <td className={`table-cell font-bold ${(item.estimated_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${item.estimated_profit?.toFixed(2) || '0.00'}
                          </td>
                          <td className="table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              (item.profit_margin || 0) >= 20 ? 'bg-green-100 text-green-800' :
                              (item.profit_margin || 0) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.profit_margin?.toFixed(1) || '0.0'}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {costBreakdownData.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-6xl text-gray-400">💸</span>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Maliyet verisi bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ürünlerinize maliyet bilgilerini ekleyin.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      </div>
    </PremiumBlur>
  );
};

export default Reports;
