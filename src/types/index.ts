export interface Product {
  id: string;
  user_id?: string;
  name: string;
  asin: string;
  merchant_sku: string;
  manufacturer_code?: string;
  manufacturer?: string;
  amazon_barcode?: string;
  product_cost?: number;
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
