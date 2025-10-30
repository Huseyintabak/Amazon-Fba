import { supabase, supabaseTyped } from './supabase';
import { Product, Shipment, ShipmentItem, DashboardStats, PurchaseOrder, PurchaseOrderItem, Supplier, Category, ProductProfitReport } from '../types';
import { logger } from './logger';

// Helper to get current user ID from session
const getUserId = async (): Promise<string> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  logger.log('Session check:', {
    hasError: !!error,
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    error
  });
  
  if (error) {
    logger.error('Session error:', error);
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
  // Get all products with supplier and category info (RLS automatically filters by user_id)
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        suppliers!left(name, country),
        categories!left(name, color, icon)
      `)
      .order('created_at', { ascending: false});

    if (error) {
      logger.error('Error loading products:', error);
      throw error;
    }
    
    // Transform data to include supplier info
    const transformedData = data?.map(product => ({
      ...product,
      supplier_name: product.suppliers?.name || '',
      supplier_country: product.suppliers?.country || ''
    })) || [];
    
    return transformedData;
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
    const userId = await getUserId();
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...product, user_id: userId }])
      .select(`
        *,
        suppliers!left(name, country),
        categories!left(name, color, icon)
      `)
      .single();

    if (error) {
      logger.error('Supabase create product error:', error);
      if (error.code === '23505') {
        throw new Error(`Ürün zaten mevcut: ${error.details || 'Duplicate key error'}`);
      }
      if (error.message && error.message.includes('limit reached')) {
        throw new Error(error.message);
      }
      throw error;
    }

    return data;
  },

  // Update product
  async update(id: string, product: Partial<Product>): Promise<Product> {
    logger.log('updateProduct called with id:', id, 'product:', product);
    
    const { data, error } = await supabase
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        suppliers!left(name, country),
        categories!left(name, color, icon)
      `)
      .single();

    if (error) {
      logger.error('updateProduct error:', error);
      throw error;
    }
    
    if (!data) {
      logger.error('updateProduct: No data returned');
      throw new Error('Product update failed - no data returned');
    }
    
    logger.log('updateProduct success, returned data:', data);
    
    // Explicit type assertion for proper return
    return data as Product;
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
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('shipment_date', { ascending: false });

    if (error) {
      logger.error('Error loading shipments:', error);
      throw error;
    }
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
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error('Error loading dashboard stats:', error);
      throw error;
    }
    
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
// PROFIT REPORTS API
// =====================================================

export const profitReportsApi = {
  async getProductProfits(limit = 5): Promise<ProductProfitReport[]> {
    const { data, error } = await supabase
      .from('product_profit_reports')
      .select('*')
      .order('net_profit', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as ProductProfitReport[];
  }
};

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Check connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
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
    logger.error('Error getting table counts:', error);
    return { products: 0, shipments: 0, items: 0 };
  }
};

// =====================================================
// PURCHASE ORDERS API
// =====================================================

export const purchaseOrdersApi = {
  // Get all purchase orders for current user
  async getAll(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(id, name, company_name, country)
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single purchase order by ID
  async getById(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        supplier:suppliers(id, name, company_name, email, phone, country),
        items:purchase_order_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new purchase order
  async create(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([{ ...po, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update purchase order
  async update(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete purchase order
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get PO stats
  async getStats() {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('status, total_amount, payment_status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      draft: data?.filter(po => po.status === 'draft').length || 0,
      submitted: data?.filter(po => po.status === 'submitted').length || 0,
      confirmed: data?.filter(po => po.status === 'confirmed').length || 0,
      shipped: data?.filter(po => po.status === 'shipped').length || 0,
      received: data?.filter(po => po.status === 'received').length || 0,
      cancelled: data?.filter(po => po.status === 'cancelled').length || 0,
      totalValue: data?.reduce((sum, po) => sum + (po.total_amount || 0), 0) || 0,
      pendingPayment: data?.filter(po => po.payment_status === 'pending').length || 0,
    };

    return stats;
  }
};

// =====================================================
// PURCHASE ORDER ITEMS API
// =====================================================

export const purchaseOrderItemsApi = {
  // Get items for a purchase order
  async getByPOId(poId: string): Promise<PurchaseOrderItem[]> {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', poId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Add item to purchase order
  async create(item: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem> {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Add multiple items at once
  async createMany(items: Partial<PurchaseOrderItem>[]): Promise<PurchaseOrderItem[]> {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Update item
  async update(id: string, updates: Partial<PurchaseOrderItem>): Promise<PurchaseOrderItem> {
    const { data, error } = await supabase
      .from('purchase_order_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete item
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// =====================================================
// SUPPLIERS API
// =====================================================

export const suppliersApi = {
  // Get all suppliers
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error loading suppliers:', error);
      throw error;
    }
    return data || [];
  },

  // Get supplier by ID
  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error loading supplier:', error);
      throw error;
    }
    return data;
  },

  // Create supplier
  async create(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ ...supplier, user_id: userId }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating supplier:', error);
      throw error;
    }
    return data;
  },

  // Update supplier
  async update(id: string, supplier: Partial<Supplier>): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id);

    if (error) {
      logger.error('Error updating supplier:', error);
      throw error;
    }
  },

  // Delete supplier
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting supplier:', error);
      throw error;
    }
  }
};

// =====================================================
// CATEGORIES API
// =====================================================

export const categoriesApi = {
  // Get all categories
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      logger.error('Error loading categories:', error);
      throw error;
    }
    return data || [];
  },

  // Get category by ID
  async getById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error loading category:', error);
      throw error;
    }
    return data;
  },

  // Create category
  async create(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const userId = await getUserId();
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...category, user_id: userId }])
      .select()
      .single();

    if (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
    return data;
  },

  // Update category
  async update(id: string, category: Partial<Category>): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id);

    if (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }
};
