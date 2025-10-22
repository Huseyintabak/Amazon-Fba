import { Product, Shipment, ShipmentItem, DashboardStats, MonthlyData, CarrierData } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    asin: 'B07KG5CBQ6',
    merchant_sku: '2L-3RP4-NL31',
    manufacturer_code: 'BGE38',
    manufacturer: 'BROSS',
    amazon_barcode: '1234567890123',
    product_cost: 25.99,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Smart Fitness Tracker',
    asin: 'B08XYZ1234',
    merchant_sku: 'FT-2024-001',
    manufacturer_code: 'FT001',
    manufacturer: 'FitTech',
    amazon_barcode: '2345678901234',
    product_cost: 89.99,
    created_at: '2024-01-16T09:30:00Z'
  },
  {
    id: '3',
    name: 'USB-C Charging Cable',
    asin: 'B09ABC5678',
    merchant_sku: 'USB-C-3FT',
    manufacturer_code: 'UC001',
    manufacturer: 'CablePro',
    amazon_barcode: '3456789012345',
    product_cost: 12.99,
    created_at: '2024-01-17T14:20:00Z'
  },
  {
    id: '4',
    name: 'Portable Power Bank',
    asin: 'B10DEF9012',
    merchant_sku: 'PB-10000',
    manufacturer_code: 'PB001',
    manufacturer: 'PowerMax',
    amazon_barcode: '4567890123456',
    product_cost: 45.99,
    created_at: '2024-01-18T11:45:00Z'
  },
  {
    id: '5',
    name: 'Bluetooth Speaker',
    asin: 'B11GHI3456',
    merchant_sku: 'BS-2024',
    manufacturer_code: 'BS001',
    manufacturer: 'SoundWave',
    amazon_barcode: '5678901234567',
    product_cost: 65.99,
    created_at: '2024-01-19T16:10:00Z'
  }
];

export const mockShipments: Shipment[] = [
  {
    id: '1',
    fba_shipment_id: 'FBA123456789',
    shipment_date: '2024-01-20',
    carrier_company: 'UPS',
    total_shipping_cost: 45.50,
    notes: 'Priority shipping for electronics',
    status: 'completed',
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    fba_shipment_id: 'FBA987654321',
    shipment_date: '2024-01-22',
    carrier_company: 'FedEx',
    total_shipping_cost: 38.75,
    notes: 'Standard shipping',
    status: 'completed',
    created_at: '2024-01-22T10:15:00Z'
  },
  {
    id: '3',
    fba_shipment_id: 'FBA555666777',
    shipment_date: '2024-01-25',
    carrier_company: 'DHL',
    total_shipping_cost: 52.00,
    notes: 'Express shipping for urgent orders',
    status: 'draft',
    created_at: '2024-01-25T09:00:00Z'
  }
];

export const mockShipmentItems: ShipmentItem[] = [
  {
    id: '1',
    shipment_id: '1',
    product_id: '1',
    quantity: 5,
    unit_shipping_cost: 9.10,
    barcode_scanned: true,
    created_at: '2024-01-20T14:30:00Z',
    product: mockProducts[0]
  },
  {
    id: '2',
    shipment_id: '1',
    product_id: '2',
    quantity: 3,
    unit_shipping_cost: 9.10,
    barcode_scanned: true,
    created_at: '2024-01-20T14:30:00Z',
    product: mockProducts[1]
  },
  {
    id: '3',
    shipment_id: '2',
    product_id: '3',
    quantity: 10,
    unit_shipping_cost: 3.88,
    barcode_scanned: true,
    created_at: '2024-01-22T10:15:00Z',
    product: mockProducts[2]
  },
  {
    id: '4',
    shipment_id: '2',
    product_id: '4',
    quantity: 2,
    unit_shipping_cost: 3.88,
    barcode_scanned: false,
    created_at: '2024-01-22T10:15:00Z',
    product: mockProducts[3]
  },
  {
    id: '5',
    shipment_id: '3',
    product_id: '5',
    quantity: 4,
    unit_shipping_cost: 13.00,
    barcode_scanned: false,
    created_at: '2024-01-25T09:00:00Z',
    product: mockProducts[4]
  }
];

// Helper functions
export const getProductsByShipment = (shipmentId: string): ShipmentItem[] => {
  return mockShipmentItems.filter(item => item.shipment_id === shipmentId);
};

export const getProductById = (productId: string): Product | undefined => {
  return mockProducts.find(product => product.id === productId);
};

export const getShipmentById = (shipmentId: string): Shipment | undefined => {
  return mockShipments.find(shipment => shipment.id === shipmentId);
};

export const getDashboardStats = (): DashboardStats => {
  const totalProducts = mockProducts.length;
  const totalShipments = mockShipments.length;
  const totalShippedQuantity = mockShipmentItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalShippingCost = mockShipmentItems.reduce((sum, item) => sum + (item.quantity * item.unit_shipping_cost), 0);

  return {
    total_products: totalProducts,
    total_shipments: totalShipments,
    total_shipped_quantity: totalShippedQuantity,
    total_shipping_cost: totalShippingCost
  };
};

export const getMonthlyData = (): MonthlyData[] => {
  return [
    { month: '2024-01', shipments: 3, shipping_cost: 136.25 },
    { month: '2023-12', shipments: 5, shipping_cost: 245.80 },
    { month: '2023-11', shipments: 4, shipping_cost: 189.50 },
    { month: '2023-10', shipments: 6, shipping_cost: 312.75 },
    { month: '2023-09', shipments: 3, shipping_cost: 156.30 },
    { month: '2023-08', shipments: 7, shipping_cost: 298.90 }
  ];
};

export const getCarrierData = (): CarrierData[] => {
  const carriers = mockShipments.reduce((acc, shipment) => {
    const carrier = shipment.carrier_company;
    acc[carrier] = (acc[carrier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(carriers).reduce((sum, count) => sum + count, 0);

  return Object.entries(carriers).map(([carrier, count]) => ({
    carrier,
    count,
    percentage: Math.round((count / total) * 100)
  }));
};
