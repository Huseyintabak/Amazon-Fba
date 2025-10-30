import { z } from 'zod';

// Product Schema
export const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Ürün adı gerekli'),
  asin: z.string().min(10, 'ASIN en az 10 karakter olmalı').optional(),
  merchant_sku: z.string().optional(),
  amazon_barcode: z.string().optional(),
  manufacturer_code: z.string().optional(),
  product_cost: z.number().min(0, 'Ürün maliyeti negatif olamaz').optional(),
  amazon_price: z.number().min(0).optional(),
  referral_fee_percent: z.number().min(0).max(100).optional(),
  fulfillment_fee: z.number().min(0).optional(),
  advertising_cost: z.number().min(0).optional(),
  initial_investment: z.number().min(0).optional(),
  category_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  image_url: z.string().url().optional(),
  notes: z.string().optional(),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Shipment Schema
export const shipmentSchema = z.object({
  id: z.string().uuid().optional(),
  fba_shipment_id: z.string().optional(),
  shipment_date: z.string().optional(),
  carrier_company: z.string().min(1, 'Kargo firması gerekli').optional(),
  total_shipping_cost: z.number().min(0).optional(),
  status: z.enum(['pending', 'in_transit', 'delivered', 'cancelled']).optional(),
  notes: z.string().optional(),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Shipment Item Schema
export const shipmentItemSchema = z.object({
  id: z.string().uuid().optional(),
  shipment_id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1, 'Miktar en az 1 olmalı'),
  unit_cost: z.number().min(0).optional(),
  sale_price: z.number().min(0).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Supplier Schema
export const supplierSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Tedarikçi adı gerekli'),
  company_name: z.string().optional(),
  email: z.string().email('Geçerli bir e-posta adresi girin').optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Category Schema
export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Kategori adı gerekli'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu girin').optional(),
  icon: z.string().optional(),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Type exports
export type ProductInput = z.infer<typeof productSchema>;
export type ShipmentInput = z.infer<typeof shipmentSchema>;
export type ShipmentItemInput = z.infer<typeof shipmentItemSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

