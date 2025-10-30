import { describe, it, expect } from 'vitest';
import { productSchema, shipmentSchema } from '../schemas';

describe('productSchema', () => {
  it('should validate correct product data', () => {
    const product = {
      name: 'Test Product',
      asin: 'B01ABC123D',
      product_cost: 10.50,
    };

    const result = productSchema.safeParse(product);
    expect(result.success).toBe(true);
  });

  it('should reject product without name', () => {
    const product = {
      asin: 'B01ABC123D',
    };

    const result = productSchema.safeParse(product);
    expect(result.success).toBe(false);
  });

  it('should reject product with negative cost', () => {
    const product = {
      name: 'Test Product',
      product_cost: -10,
    };

    const result = productSchema.safeParse(product);
    expect(result.success).toBe(false);
  });
});

describe('shipmentSchema', () => {
  it('should validate correct shipment data', () => {
    const shipment = {
      fba_shipment_id: 'SH123456',
      carrier_company: 'UPS',
      total_shipping_cost: 25.99,
    };

    const result = shipmentSchema.safeParse(shipment);
    expect(result.success).toBe(true);
  });
});

