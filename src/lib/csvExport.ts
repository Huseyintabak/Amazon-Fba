// CSV Export Utility Functions
import type { Product } from '../types';

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = <T extends Record<string, unknown>>(data: T[], headers: string[]): string => {
  if (data.length === 0) return '';
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export products for update (CSV format compatible with import)
 */
export const exportProductsForUpdate = (products: Product[]): void => {
  const headers = [
    'Ürün Adı',
    'ASIN',
    'Merchant SKU',
    'Üretici Kodu',
    'Amazon Barkod',
    'Ürün Maliyeti',
    'Amazon Fiyatı',
    'Referans Ücreti',
    'Fulfillment Ücreti',
    'Reklam Maliyeti',
    'İlk Yatırım'
  ];
  
  const csvData = products.map(product => ({
    'Ürün Adı': product.name || '',
    'ASIN': product.asin || '',
    'Merchant SKU': product.merchant_sku || '',
    'Üretici Kodu': product.manufacturer_code || '',
    'Amazon Barkod': product.amazon_barcode || '',
    'Ürün Maliyeti': product.product_cost || '',
    'Amazon Fiyatı': product.amazon_price || '',
    'Referans Ücreti': product.referral_fee_percent || '',
    'Fulfillment Ücreti': product.fulfillment_fee || '',
    'Reklam Maliyeti': product.advertising_cost || '',
    'İlk Yatırım': product.initial_investment || ''
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const filename = `urunler-guncelleme-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * Export product report to CSV (detailed report)
 */
export const exportProductReport = (products: Product[]): void => {
  const headers = [
    'ASIN',
    'Ürün Adı',
    'Merchant SKU',
    'Üretici Kodu',
    'Amazon Barkod',
    'Ürün Maliyeti',
    'Amazon Fiyatı',
    'Referans Ücreti',
    'Fulfillment Ücreti',
    'Reklam Maliyeti',
    'İlk Yatırım',
    'Tedarikçi Adı',
    'Tedarikçi Ülkesi',
    'Oluşturulma Tarihi'
  ];
  
  const csvData = products.map(product => ({
    'ASIN': product.asin || '',
    'Ürün Adı': product.name || '',
    'Merchant SKU': product.merchant_sku || '',
    'Üretici Kodu': product.manufacturer_code || '',
    'Amazon Barkod': product.amazon_barcode || '',
    'Ürün Maliyeti': product.product_cost ? product.product_cost.toString() : '',
    'Amazon Fiyatı': product.amazon_price ? product.amazon_price.toString() : '',
    'Referans Ücreti': product.referral_fee_percent ? product.referral_fee_percent.toString() : '',
    'Fulfillment Ücreti': product.fulfillment_fee ? product.fulfillment_fee.toString() : '',
    'Reklam Maliyeti': product.advertising_cost ? product.advertising_cost.toString() : '',
    'İlk Yatırım': product.initial_investment ? product.initial_investment.toString() : '',
    'Tedarikçi Adı': product.supplier_name || '',
    'Tedarikçi Ülkesi': product.supplier_country || '',
    'Oluşturulma Tarihi': product.created_at ? new Date(product.created_at).toLocaleDateString('tr-TR') : ''
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const filename = `urun-raporu-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};