import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://rwxkjsnnemzuxtrzygzq.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3eGtqc25uZW16dXh0cnp5Z3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzQzMjIsImV4cCI6MjA3NjcxMDMyMn0._FhKrcRXwYNi4Chq2Cqevv4aDN3yl6OFXK3vtLBWcds';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types (generated from Supabase)
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          asin: string;
          merchant_sku: string;
          manufacturer_code: string | null;
          manufacturer: string | null;
          amazon_barcode: string | null;
          product_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          asin: string;
          merchant_sku: string;
          manufacturer_code?: string | null;
          manufacturer?: string | null;
          amazon_barcode?: string | null;
          product_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          asin?: string;
          merchant_sku?: string;
          manufacturer_code?: string | null;
          manufacturer?: string | null;
          amazon_barcode?: string | null;
          product_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      shipments: {
        Row: {
          id: string;
          fba_shipment_id: string;
          shipment_date: string;
          carrier_company: string;
          total_shipping_cost: number;
          notes: string | null;
          status: 'draft' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fba_shipment_id: string;
          shipment_date: string;
          carrier_company: string;
          total_shipping_cost: number;
          notes?: string | null;
          status?: 'draft' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fba_shipment_id?: string;
          shipment_date?: string;
          carrier_company?: string;
          total_shipping_cost?: number;
          notes?: string | null;
          status?: 'draft' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      shipment_items: {
        Row: {
          id: string;
          shipment_id: string;
          product_id: string;
          quantity: number;
          unit_shipping_cost: number;
          barcode_scanned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          product_id: string;
          quantity: number;
          unit_shipping_cost: number;
          barcode_scanned?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          product_id?: string;
          quantity?: number;
          unit_shipping_cost?: number;
          barcode_scanned?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          total_products: number;
          total_shipments: number;
          total_shipped_quantity: number;
          total_shipping_cost: number;
        };
      };
      product_reports: {
        Row: {
          id: string;
          asin: string;
          name: string;
          manufacturer: string | null;
          product_cost: number;
          total_shipped: number;
          total_shipping_cost: number;
          avg_unit_cost: number;
          shipment_count: number;
          last_shipment_date: string | null;
        };
      };
      monthly_shipment_data: {
        Row: {
          year: number;
          month: number;
          shipment_count: number;
          total_cost: number;
          total_quantity: number;
        };
      };
      carrier_performance: {
        Row: {
          carrier_company: string;
          shipment_count: number;
          percentage: number;
          total_cost: number;
          avg_cost: number;
        };
      };
    };
  };
}

// Type-safe Supabase client
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper functions
export const getSupabaseUrl = () => supabaseUrl;
export const getSupabaseAnonKey = () => supabaseAnonKey;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key';
};
