import { create } from 'zustand';
import { Product, Shipment, ShipmentItem, DashboardStats } from '../types';
import { 
  productsApi, 
  shipmentsApi, 
  shipmentItemsApi, 
  dashboardApi,
  checkConnection,
  getTableCounts
} from '../lib/supabaseApi';

interface SupabaseState {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Data
  products: Product[];
  shipments: Shipment[];
  dashboardStats: DashboardStats | null;

  // Actions
  checkConnection: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadShipments: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadAllData: () => Promise<void>;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Shipment actions
  addShipment: (shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateShipment: (id: string, shipment: Partial<Shipment>) => Promise<void>;
  deleteShipment: (id: string) => Promise<void>;

  // Shipment items actions
  addShipmentItem: (item: Omit<ShipmentItem, 'id' | 'created_at'>) => Promise<void>;
  updateShipmentItem: (id: string, item: Partial<ShipmentItem>) => Promise<void>;
  deleteShipmentItem: (id: string) => Promise<void>;
  deleteShipmentItems: (shipmentId: string) => Promise<void>;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

export const useSupabaseStore = create<SupabaseState>((set, get) => ({
  // Initial state
  isConnected: false,
  isLoading: false,
  error: null,
  products: [],
  shipments: [],
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
      console.log('Loaded products:', products.length);
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Error loading products:', error);
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
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load shipments' 
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
    }
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
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add shipment' 
      });
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
    }
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
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  reset: () => set({ 
    isConnected: false, 
    isLoading: false, 
    error: null, 
    products: [], 
    shipments: [], 
    dashboardStats: null 
  })
}));
