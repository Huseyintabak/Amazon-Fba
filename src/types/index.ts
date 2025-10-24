export interface Product {
  id: string;
  user_id?: string;
  name: string;
  asin: string;
  merchant_sku: string;
  manufacturer_code?: string;
  amazon_barcode?: string;
  product_cost?: number;
  // Profit Calculator fields
  amazon_price?: number;
  referral_fee_percent?: number;
  fulfillment_fee?: number;
  advertising_cost?: number;
  estimated_profit?: number;
  profit_margin?: number;
  // ROI Tracking fields
  initial_investment?: number;
  units_sold?: number;
  revenue_generated?: number;
  roi_percentage?: number;
  // Supplier link
  supplier_id?: string;
  supplier_name?: string;
  supplier_company?: string;
  supplier_country?: string;
  // Notes
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// ROI & P/L Types
export interface ProfitLossSummary {
  user_id: string;
  month: string;
  total_products: number;
  total_investment: number;
  total_revenue: number;
  cost_of_goods_sold: number;
  shipping_costs: number;
  gross_profit: number;
  net_profit: number;
  profit_margin_percentage: number;
}

export interface CostBreakdown {
  user_id: string;
  product_id: string;
  product_name: string;
  product_cost: number;
  fulfillment_fee: number;
  advertising_cost: number;
  referral_fee: number;
  total_cost: number;
  estimated_profit: number;
  profit_margin: number;
  product_cost_percentage: number;
  fulfillment_cost_percentage: number;
  advertising_cost_percentage: number;
  referral_fee_percentage: number;
}

export interface ROIPerformance {
  user_id: string;
  product_id: string;
  product_name: string;
  initial_investment: number;
  units_sold: number;
  revenue_generated: number;
  total_costs: number;
  net_profit: number;
  roi_percentage: number;
  supplier_name?: string;
  supplier_country?: string;
}

export interface ProfitCalculation {
  gross_revenue: number;
  referral_fee: number;
  total_costs: number;
  net_profit: number;
  profit_margin: number;
}

// Supplier Management Types
export interface Supplier {
  id: string;
  user_id?: string;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  address?: string;
  contact_person?: string;
  website?: string;
  notes?: string;
  payment_terms?: string;
  currency?: string;
  lead_time_days?: number;
  minimum_order_quantity?: number;
  rating?: number;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id: string;
  user_id?: string;
  supplier_id: string;
  po_number: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  total_amount?: number;
  currency?: string;
  payment_status?: 'pending' | 'partial' | 'paid' | 'refunded';
  shipping_cost?: number;
  tax_amount?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  received_quantity?: number;
  created_at: string;
  updated_at?: string;
}

export interface Shipment {
  id: string;
  user_id?: string;
  fba_shipment_id: string;
  shipment_date: string;
  carrier_company: string;
  total_shipping_cost: number;
  notes?: string;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at?: string;
}

export interface ShipmentItem {
  id: string;
  shipment_id: string;
  product_id: string;
  quantity: number;
  unit_shipping_cost: number;
  barcode_scanned: boolean;
  created_at: string;
  product?: Product;
}

export interface DashboardStats {
  total_products: number;
  total_shipments: number;
  total_shipped_quantity: number;
  total_shipping_cost: number;
}

export interface MonthlyData {
  month: string;
  shipments: number;
  shipping_cost: number;
}

export interface CarrierData {
  carrier: string;
  count: number;
  percentage: number;
}

export interface ProductReport {
  asin: string;
  name: string;
  total_shipped: number;
  total_shipping_cost: number;
}

export interface ShipmentReport {
  date: string;
  carrier: string;
  count: number;
  total_cost: number;
}
