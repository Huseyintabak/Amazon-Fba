import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Shipment, ShipmentItem, DashboardStats, Supplier } from '../types';
import { 
  productsApi, 
  shipmentsApi, 
  shipmentItemsApi, 
  dashboardApi,
  suppliersApi,
  checkConnection
} from '../lib/supabaseApi';
import { logger } from '../lib/logger';

interface StoreState {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Data - ALWAYS USE SUPABASE (no mock data)
  products: Product[];
  shipments: Shipment[];
  suppliers: Supplier[];
  dashboardStats: DashboardStats | null;

  // Actions
  checkConnection: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadShipments: () => Promise<void>;
  loadSuppliers: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadAllData: () => Promise<void>;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;

  // Shipment actions
  addShipment: (shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<Shipment>;
  updateShipment: (id: string, shipment: Partial<Shipment>) => Promise<void>;
  deleteShipment: (id: string) => Promise<void>;
  getShipmentById: (id: string) => Shipment | undefined;

  // Shipment items actions
  addShipmentItem: (item: Omit<ShipmentItem, 'id' | 'created_at'>) => Promise<void>;
  updateShipmentItem: (id: string, item: Partial<ShipmentItem>) => Promise<void>;
  deleteShipmentItem: (id: string) => Promise<void>;
  deleteShipmentItems: (shipmentId: string) => Promise<void>;
  getItemsByShipment: (shipmentId: string) => ShipmentItem[];

  // Statistics
  getDashboardStats: () => {
    total_products: number;
    total_shipments: number;
    total_shipped_quantity: number;
    total_shipping_cost: number;
  };

  // Product Statistics
  getProductStats: (productId: string) => {
    totalShipped: number;
    totalShippingCost: number;
    averageUnitCost: number;
    lastShipmentDate: string | null;
    shipmentCount: number;
  };

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      isLoading: false,
      error: null,
      products: [],
      shipments: [],
      suppliers: [],
      dashboardStats: null,

      // Check connection
      checkConnection: async () => {
        set({ isLoading: true, error: null });
        try {
          const connected = await checkConnection();
          set({ isConnected: connected, isLoading: false });
        } catch (error) {
          set({ 
            isConnected: false, 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Connection failed' 
          });
        }
      },

      // Load products
      loadProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const products = await productsApi.getAll();
          set({ products, isLoading: false });
        } catch (error) {
          logger.error('Error loading products:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load products' 
          });
        }
      },

      // Load shipments
      loadShipments: async () => {
        set({ isLoading: true, error: null });
        try {
          const shipments = await shipmentsApi.getAll();
          set({ shipments, isLoading: false });
        } catch (error) {
          logger.error('Error loading shipments:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load shipments' 
          });
        }
      },

      // Load suppliers
      loadSuppliers: async () => {
        set({ isLoading: true, error: null });
        try {
          const suppliers = await suppliersApi.getAll();
          set({ suppliers, isLoading: false });
        } catch (error) {
          logger.error('Error loading suppliers:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load suppliers' 
          });
        }
      },

      // Load dashboard stats
      loadDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await dashboardApi.getStats();
          set({ dashboardStats: stats, isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load dashboard stats' 
          });
        }
      },

      // Load all data
      loadAllData: async () => {
        set({ isLoading: true, error: null });
        try {
          await Promise.all([
            get().loadProducts(),
            get().loadShipments(),
            get().loadSuppliers(),
            get().loadDashboardStats()
          ]);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to load data' 
          });
        }
      },

      // Product actions
      addProduct: async (product) => {
        set({ isLoading: true, error: null });
        try {
          const newProduct = await productsApi.create(product);
          set(state => ({ 
            products: [newProduct, ...state.products], 
            isLoading: false 
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to add product' 
          });
          throw error;
        }
      },

      updateProduct: async (id, product) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProduct = await productsApi.update(id, product);
          set(state => ({
            products: state.products.map(p => p.id === id ? updatedProduct : p),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update product' 
          });
          throw error;
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await productsApi.delete(id);
          set(state => ({
            products: state.products.filter(p => p.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete product' 
          });
          throw error;
        }
      },

      getProductById: (id: string) => {
        return get().products.find(p => p.id === id);
      },

      // Shipment actions
      addShipment: async (shipment) => {
        set({ isLoading: true, error: null });
        try {
          const newShipment = await shipmentsApi.create(shipment);
          set(state => ({ 
            shipments: [newShipment, ...state.shipments], 
            isLoading: false 
          }));
          return newShipment;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to add shipment' 
          });
          throw error;
        }
      },

      updateShipment: async (id, shipment) => {
        set({ isLoading: true, error: null });
        try {
          const updatedShipment = await shipmentsApi.update(id, shipment);
          set(state => ({
            shipments: state.shipments.map(s => s.id === id ? updatedShipment : s),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update shipment' 
          });
          throw error;
        }
      },

      deleteShipment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await shipmentsApi.delete(id);
          set(state => ({
            shipments: state.shipments.filter(s => s.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete shipment' 
          });
          throw error;
        }
      },

      getShipmentById: (id: string) => {
        return get().shipments.find(s => s.id === id);
      },

      // Shipment items actions
      addShipmentItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          await shipmentItemsApi.create(item);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to add shipment item' 
          });
          throw error;
        }
      },

      updateShipmentItem: async (id, item) => {
        set({ isLoading: true, error: null });
        try {
          await shipmentItemsApi.update(id, item);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update shipment item' 
          });
          throw error;
        }
      },

      deleteShipmentItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await shipmentItemsApi.delete(id);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete shipment item' 
          });
          throw error;
        }
      },

      deleteShipmentItems: async (shipmentId) => {
        set({ isLoading: true, error: null });
        try {
          await shipmentItemsApi.deleteByShipmentId(shipmentId);
          set({ isLoading: false });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to delete shipment items' 
          });
          throw error;
        }
      },

      getItemsByShipment: (shipmentId: string) => {
        // This would need to load shipment items if not already loaded
        // For now, return empty array as shipment items are not stored in the store
        return [];
      },

      // Statistics
      getDashboardStats: () => {
        const state = get();
        const stats = state.dashboardStats;
        
        if (stats) {
          return {
            total_products: stats.total_products || 0,
            total_shipments: stats.total_shipments || 0,
            total_shipped_quantity: stats.total_shipped_quantity || 0,
            total_shipping_cost: stats.total_shipping_cost || 0
          };
        }

        // Fallback to calculated stats
        const totalShippingCost = state.shipments.reduce((sum, shipment) => 
          sum + (shipment.total_shipping_cost || 0), 0
        );

        return {
          total_products: state.products.length,
          total_shipments: state.shipments.length,
          total_shipped_quantity: 0, // This would need shipment items
          total_shipping_cost: totalShippingCost
        };
      },

      // Product Statistics
      getProductStats: (productId: string) => {
        const state = get();
        const productShipments = state.shipments
          .filter(shipment => {
            // This would need shipment items to be loaded
            return false; // Simplified for now
          });

        return {
          totalShipped: 0,
          totalShippingCost: 0,
          averageUnitCost: 0,
          lastShipmentDate: null,
          shipmentCount: 0
        };
      },

      // Utility actions
      clearError: () => set({ error: null }),
      reset: () => set({ 
        isConnected: false, 
        isLoading: false, 
        error: null, 
        products: [], 
        shipments: [], 
        suppliers: [],
        dashboardStats: null 
      })
    }),
    {
      name: 'planet-fba-store',
      partialize: (state) => ({
        // Only persist user preferences, not data
        // Data will always be loaded fresh from Supabase
      })
    }
  )
);
