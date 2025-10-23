import { supabase, supabaseTyped } from './supabase';
import { Product, Shipment, ShipmentItem, DashboardStats } from '../types';

// Helper to get current user ID from session
const getUserId = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.log('Session check:', {
    hasError: !!error,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    error
  });
  
  if (error) {
    console.error('Session error:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }
  
  if (!session) {
    throw new Error('No active session. Please log in again.');
  }
  
  if (!session.user) {
    throw new Error('No user in session. Please log in again.');
  }
  
  if (!session.user.id) {
    throw new Error('No user ID in session. Please log in again.');
  }
  
  return session.user.id;
};

// =====================================================
// PRODUCTS API
// =====================================================

export const productsApi = {
  // Get all products with supplier info (RLS automatically filters by user_id)
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products_with_supplier')
      .select('*')
      .order('created_at', { ascending: false});

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

  // Create product using RPC function (bypasses session issues)
  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Product> {
    const { data, error } = await supabase.rpc('create_product_with_user', {
      p_name: product.name,
      p_asin: product.asin,
      p_merchant_sku: product.merchant_sku,
      p_manufacturer_code: product.manufacturer_code || null,
      p_amazon_barcode: product.amazon_barcode || null,
      p_product_cost: product.product_cost || 0
    });

    if (error) {
      console.error('Supabase create product error:', error);
      if (error.code === '23505') {
        throw new Error(`Ürün zaten mevcut: ${error.details || 'Duplicate key error'}`);
      }
      if (error.message && error.message.includes('limit reached')) {
        throw new Error(error.message);
      }
      throw error;
    }
    
    // RPC returns array, get first item
    return data && data.length > 0 ? data[0] : data;
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
  async create(shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Shipment> {
    // Get user_id from session and explicitly add it
    const user_id = await getUserId();
    
    const { data, error } = await supabaseTyped
      .from('shipments')
      .insert([{ ...shipment, user_id }] as any)
      .select()
      .single();

    if (error) {
      if (error.message && error.message.includes('shipment limit reached')) {
        throw new Error(error.message);
      }
      throw error;
    }
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
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    
    // If no data (new user with no products), return empty stats
    if (!data) {
      const user_id = await getUserId();
      return {
        user_id,
        total_products: 0,
        total_shipments: 0,
        total_shipped_quantity: 0,
        total_shipping_cost: 0,
      } as DashboardStats;
    }
    
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
