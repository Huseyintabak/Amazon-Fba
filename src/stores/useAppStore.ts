import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Shipment, ShipmentItem } from '../types';
import { mockProducts, mockShipments, getProductsByShipment } from '../lib/mockData';

interface AppState {
  // Auth
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  
  // Shipments
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, shipment: Shipment) => void;
  deleteShipment: (id: string) => void;
  getShipmentById: (id: string) => Shipment | undefined;
  
  // Shipment Items
  shipmentItems: ShipmentItem[];
  addShipmentItem: (item: ShipmentItem) => void;
  updateShipmentItem: (id: string, item: ShipmentItem) => void;
  deleteShipmentItem: (id: string) => void;
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
  
  // Reset to mock data
  resetToMockData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      login: (password: string) => {
        if (password === 'fba2024') {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ isAuthenticated: false });
      },
      
      // Products
      products: mockProducts,
      addProduct: (product: Product) => {
        set((state) => ({
          products: [...state.products, product]
        }));
      },
      updateProduct: (id: string, product: Product) => {
        set((state) => ({
          products: state.products.map(p => p.id === id ? product : p)
        }));
      },
      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter(p => p.id !== id)
        }));
      },
      getProductById: (id: string) => {
        return get().products.find(p => p.id === id);
      },
      
      // Shipments
      shipments: mockShipments,
      addShipment: (shipment: Shipment) => {
        set((state) => ({
          shipments: [...state.shipments, shipment]
        }));
      },
      updateShipment: (id: string, shipment: Shipment) => {
        set((state) => ({
          shipments: state.shipments.map(s => s.id === id ? shipment : s)
        }));
      },
      deleteShipment: (id: string) => {
        set((state) => ({
          shipments: state.shipments.filter(s => s.id !== id)
        }));
      },
      getShipmentById: (id: string) => {
        return get().shipments.find(s => s.id === id);
      },
      
      // Shipment Items
      shipmentItems: getProductsByShipment('1').concat(
        getProductsByShipment('2'),
        getProductsByShipment('3')
      ),
      addShipmentItem: (item: ShipmentItem) => {
        set((state) => ({
          shipmentItems: [...state.shipmentItems, item]
        }));
      },
      updateShipmentItem: (id: string, item: ShipmentItem) => {
        set((state) => ({
          shipmentItems: state.shipmentItems.map(i => i.id === id ? item : i)
        }));
      },
      deleteShipmentItem: (id: string) => {
        set((state) => ({
          shipmentItems: state.shipmentItems.filter(i => i.id !== id)
        }));
      },
      getItemsByShipment: (shipmentId: string) => {
        return get().shipmentItems.filter(item => item.shipment_id === shipmentId);
      },
      
      // Statistics
      getDashboardStats: () => {
        const state = get();
        const totalShippedQuantity = state.shipmentItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalShippingCost = state.shipments.reduce((sum, shipment) => sum + shipment.total_shipping_cost, 0);
        
        return {
          total_products: state.products.length,
          total_shipments: state.shipments.length,
          total_shipped_quantity: totalShippedQuantity,
          total_shipping_cost: totalShippingCost
        };
      },
      
      // Product Statistics
      getProductStats: (productId: string) => {
        const state = get();
        const productShipments = state.shipmentItems
          .filter(item => item.product_id === productId)
          .map(item => ({
            shipment: state.shipments.find(s => s.id === item.shipment_id),
            item
          }))
          .filter(({ shipment }) => shipment)
          .sort((a, b) => 
            new Date(b.shipment!.shipment_date).getTime() - new Date(a.shipment!.shipment_date).getTime()
          );
        
        const totalShipped = productShipments.reduce((sum, { item }) => sum + item.quantity, 0);
        const totalShippingCost = productShipments.reduce((sum, { item }) => 
          sum + (item.quantity * item.unit_shipping_cost), 0
        );
        const averageUnitCost = totalShipped > 0 ? totalShippingCost / totalShipped : 0;
        const lastShipmentDate = productShipments.length > 0 
          ? productShipments[0].shipment!.shipment_date 
          : null;
        
        return {
          totalShipped,
          totalShippingCost,
          averageUnitCost,
          lastShipmentDate,
          shipmentCount: productShipments.length
        };
      },
      
      // Reset to mock data
      resetToMockData: () => {
        set({
          products: mockProducts,
          shipments: mockShipments,
          shipmentItems: getProductsByShipment('1').concat(
            getProductsByShipment('2'),
            getProductsByShipment('3')
          )
        });
      }
    }),
    {
      name: 'amazon-fba-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        products: state.products,
        shipments: state.shipments,
        shipmentItems: state.shipmentItems
      })
    }
  )
);
