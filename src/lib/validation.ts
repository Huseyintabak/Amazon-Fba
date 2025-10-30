// Form validation utilities
import type { Product, Shipment } from '../types';
import { productSchema, shipmentSchema, categorySchema, supplierSchema } from './schemas';
import { ZodError } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Generic validation helper
const zodToValidationResult = (result: { success: boolean; error?: ZodError }): ValidationResult => {
  if (result.success) {
    return { isValid: true, errors: [] };
  }

  const errors: ValidationError[] = [];
  result.error?.errors.forEach((err) => {
    errors.push({
      field: err.path.join('.'),
      message: err.message
    });
  });

  return {
    isValid: false,
    errors
  };
};

// Product validation
export const validateProduct = (product: unknown): ValidationResult => {
  const result = productSchema.safeParse(product);
  return zodToValidationResult(result);
};

// Temporary backward compatibility - will be removed
export const validateProductOld = (product: Partial<Product>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!product.name || product.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Ürün adı gerekli' });
  }

  if (!product.asin || product.asin.trim().length === 0) {
    errors.push({ field: 'asin', message: 'ASIN gerekli' });
  } else if (product.asin.length < 10) {
    errors.push({ field: 'asin', message: 'ASIN en az 10 karakter olmalı' });
  }

  if (!product.merchant_sku || product.merchant_sku.trim().length === 0) {
    errors.push({ field: 'merchant_sku', message: 'Merchant SKU gerekli' });
  }

  // Optional fields validation
  if (product.product_cost !== undefined && product.product_cost < 0) {
    errors.push({ field: 'product_cost', message: 'Ürün maliyeti negatif olamaz' });
  }

  if (product.amazon_barcode && product.amazon_barcode.length < 8) {
    errors.push({ field: 'amazon_barcode', message: 'Amazon barkodu en az 8 karakter olmalı' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Shipment validation
export const validateShipment = (shipment: Partial<Shipment>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!shipment.fba_shipment_id || shipment.fba_shipment_id.trim().length === 0) {
    errors.push({ field: 'fba_shipment_id', message: 'FBA Shipment ID gerekli' });
  }

  if (!shipment.shipment_date) {
    errors.push({ field: 'shipment_date', message: 'Sevkiyat tarihi gerekli' });
  } else {
    const shipmentDate = new Date(shipment.shipment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (shipmentDate > today) {
      errors.push({ field: 'shipment_date', message: 'Sevkiyat tarihi gelecekte olamaz' });
    }
  }

  if (!shipment.carrier_company || shipment.carrier_company.trim().length === 0) {
    errors.push({ field: 'carrier_company', message: 'Kargo firması gerekli' });
  }

  if (shipment.total_shipping_cost === undefined || shipment.total_shipping_cost === null) {
    errors.push({ field: 'total_shipping_cost', message: 'Toplam kargo maliyeti gerekli' });
  } else if (shipment.total_shipping_cost < 0) {
    errors.push({ field: 'total_shipping_cost', message: 'Kargo maliyeti negatif olamaz' });
  }

  // Items validation
  if (!shipment.items || shipment.items.length === 0) {
    errors.push({ field: 'items', message: 'En az bir ürün seçilmelidir' });
  } else {
    shipment.items.forEach((item: Record<string, unknown>, index: number) => {
      if (!item.product_id) {
        errors.push({ field: `items[${index}].product_id`, message: 'Ürün seçilmelidir' });
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'Miktar 0\'dan büyük olmalıdır' });
      }
      if (!item.unit_shipping_cost || item.unit_shipping_cost < 0) {
        errors.push({ field: `items[${index}].unit_shipping_cost`, message: 'Birim kargo maliyeti geçerli olmalıdır' });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generic field validation
export const validateField = (value: unknown, rules: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}): string | null => {
  if (rules.required && (!value || value.toString().trim().length === 0)) {
    return 'Bu alan gerekli';
  }

  if (value && rules.minLength && value.toString().length < rules.minLength) {
    return `En az ${rules.minLength} karakter olmalı`;
  }

  if (value && rules.maxLength && value.toString().length > rules.maxLength) {
    return `En fazla ${rules.maxLength} karakter olmalı`;
  }

  if (value && rules.min !== undefined && Number(value) < rules.min) {
    return `En az ${rules.min} olmalı`;
  }

  if (value && rules.max !== undefined && Number(value) > rules.max) {
    return `En fazla ${rules.max} olmalı`;
  }

  if (value && rules.pattern && !rules.pattern.test(value.toString())) {
    return 'Geçersiz format';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL validation
export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
