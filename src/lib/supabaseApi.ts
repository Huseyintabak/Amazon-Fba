import { supabaseTyped } from './supabase';
import { Product, Shipment, ShipmentItem, DashboardStats } from '../types';

// =====================================================
// PRODUCTS API
// =====================================================

export const productsApi = {
  // Get all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabaseTyped
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseTyped
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create product
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabaseTyped
      .from('products')
      .insert([product] as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase create product error:', error);
      if (error.code === '23505') {
        throw new Error(`Ürün zaten mevcut: ${error.details || 'Duplicate key error'}`);
      }
      throw error;
    }
    return data;
  },

  // Update product
  async update(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabaseTyped
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async delete(id: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Search products
  async search(searchTerm: string): Promise<Product[]> {
    const { data, error } = await supabaseTyped
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%, asin.ilike.%${searchTerm}%, merchant_sku.ilike.%${searchTerm}%, manufacturer.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// SHIPMENTS API
// =====================================================

export const shipmentsApi = {
  // Get all shipments
  async getAll(): Promise<Shipment[]> {
    const { data, error } = await supabaseTyped
      .from('shipments')
      .select('*')
      .order('shipment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get shipment by ID
  async getById(id: string): Promise<Shipment | null> {
    const { data, error } = await supabaseTyped
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create shipment
  async create(shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>): Promise<Shipment> {
    const { data, error } = await supabaseTyped
      .from('shipments')
      .insert([shipment] as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update shipment
  async update(id: string, shipment: Partial<Shipment>): Promise<Shipment> {
    const { data, error } = await supabaseTyped
      .from('shipments')
      .update({ ...shipment, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete shipment
  async delete(id: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('shipments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get shipments with items
  async getWithItems(id: string): Promise<Shipment & { items: ShipmentItem[] } | null> {
    const { data: shipment, error: shipmentError } = await supabaseTyped
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();

    if (shipmentError) throw shipmentError;
    if (!shipment) return null;

    const { data: items, error: itemsError } = await supabaseTyped
      .from('shipment_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('shipment_id', id);

    if (itemsError) throw itemsError;

    return {
      ...shipment,
      items: items || []
    } as any;
  }
};

// =====================================================
// SHIPMENT ITEMS API
// =====================================================

export const shipmentItemsApi = {
  // Get items by shipment ID
  async getByShipmentId(shipmentId: string): Promise<ShipmentItem[]> {
    const { data, error } = await supabaseTyped
      .from('shipment_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Create shipment item
  async create(item: Omit<ShipmentItem, 'id' | 'created_at'>): Promise<ShipmentItem> {
    const { data, error } = await supabaseTyped
      .from('shipment_items')
      .insert([item] as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update shipment item
  async update(id: string, item: Partial<Omit<ShipmentItem, 'id' | 'created_at'>>): Promise<ShipmentItem> {
    const { data, error } = await supabaseTyped
      .from('shipment_items')
      .update(item as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete shipment item
  async delete(id: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('shipment_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Delete all items for a shipment
  async deleteByShipmentId(shipmentId: string): Promise<void> {
    const { error } = await supabaseTyped
      .from('shipment_items')
      .delete()
      .eq('shipment_id', shipmentId);

    if (error) throw error;
  },

  // Bulk create items
  async createBulk(items: Omit<ShipmentItem, 'id' | 'created_at'>[]): Promise<ShipmentItem[]> {
    if (items.length === 0) return [];

    const { data, error } = await supabaseTyped
      .from('shipment_items')
      .insert(items as any)
      .select();

    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// DASHBOARD API
// =====================================================

export const dashboardApi = {
  // Get dashboard stats
  async getStats(): Promise<DashboardStats> {
    const { data, error } = await supabaseTyped
      .from('dashboard_stats')
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  // Get product reports
  async getProductReports() {
    const { data, error } = await supabaseTyped
      .from('product_reports')
      .select('*')
      .order('total_shipped', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get monthly data
  async getMonthlyData() {
    const { data, error } = await supabaseTyped
      .from('monthly_shipment_data')
      .select('*')
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get carrier performance
  async getCarrierPerformance() {
    const { data, error } = await supabaseTyped
      .from('carrier_performance')
      .select('*')
      .order('shipment_count', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Check connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabaseTyped
      .from('products')
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
};

// Get table counts
export const getTableCounts = async () => {
  try {
    const [productsResult, shipmentsResult, itemsResult] = await Promise.all([
      supabaseTyped.from('products').select('id', { count: 'exact', head: true }),
      supabaseTyped.from('shipments').select('id', { count: 'exact', head: true }),
      supabaseTyped.from('shipment_items').select('id', { count: 'exact', head: true })
    ]);

    return {
      products: productsResult.count || 0,
      shipments: shipmentsResult.count || 0,
      items: itemsResult.count || 0
    };
  } catch (error) {
    console.error('Error getting table counts:', error);
    return { products: 0, shipments: 0, items: 0 };
  }
};
