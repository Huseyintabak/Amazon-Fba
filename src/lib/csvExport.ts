// CSV Export Utility Functions

/**
 * Convert array of objects to CSV string
 */
export const convertToCSV = (data: any[], headers: string[]): string => {
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
 * Export product report to CSV
 */
export const exportProductReport = (products: any[]): void => {
  const headers = [
    'ASIN',
    'Ürün Adı',
    'Merchant SKU',
    'Üretici',
    'Üretici Kodu',
    'Amazon Barkod',
    'Ürün Maliyeti',
    'Toplam Sevk Edilen',
    'Toplam Kargo Maliyeti',
    'Ortalama Birim Maliyet',
    'Sevkiyat Sayısı',
    'Son Sevkiyat Tarihi',
    'Oluşturulma Tarihi'
  ];
  
  const csvData = products.map(product => ({
    'ASIN': product.asin || '',
    'Ürün Adı': product.name || '',
    'Merchant SKU': product.merchant_sku || '',
    'Üretici': product.manufacturer || '',
    'Üretici Kodu': product.manufacturer_code || '',
    'Amazon Barkod': product.amazon_barcode || '',
    'Ürün Maliyeti': product.product_cost ? `$${product.product_cost.toFixed(2)}` : '',
    'Toplam Sevk Edilen': product.totalShipped || 0,
    'Toplam Kargo Maliyeti': product.totalShippingCost ? `$${product.totalShippingCost.toFixed(2)}` : '$0.00',
    'Ortalama Birim Maliyet': product.averageUnitCost ? `$${product.averageUnitCost.toFixed(2)}` : '$0.00',
    'Sevkiyat Sayısı': product.shipmentCount || 0,
    'Son Sevkiyat Tarihi': product.lastShipmentDate ? new Date(product.lastShipmentDate).toLocaleDateString('tr-TR') : '',
    'Oluşturulma Tarihi': new Date(product.created_at).toLocaleDateString('tr-TR')
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const filename = `urun-raporu-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * Export shipment report to CSV
 */
export const exportShipmentReport = (shipments: any[]): void => {
  const headers = [
    'FBA Shipment ID',
    'Sevkiyat Tarihi',
    'Kargo Firması',
    'Toplam Kargo Maliyeti',
    'Durum',
    'Notlar',
    'Ürün Sayısı',
    'Toplam Adet',
    'Ortalama Birim Maliyet',
    'Oluşturulma Tarihi'
  ];
  
  const csvData = shipments.map(shipment => ({
    'FBA Shipment ID': shipment.fba_shipment_id || '',
    'Sevkiyat Tarihi': new Date(shipment.shipment_date).toLocaleDateString('tr-TR'),
    'Kargo Firması': shipment.carrier_company || '',
    'Toplam Kargo Maliyeti': `$${shipment.total_shipping_cost.toFixed(2)}`,
    'Durum': shipment.status === 'completed' ? 'Tamamlandı' : 'Taslak',
    'Notlar': shipment.notes || '',
    'Ürün Sayısı': shipment.productCount || 0,
    'Toplam Adet': shipment.totalQuantity || 0,
    'Ortalama Birim Maliyet': shipment.averageUnitCost ? `$${shipment.averageUnitCost.toFixed(2)}` : '$0.00',
    'Oluşturulma Tarihi': new Date(shipment.created_at).toLocaleDateString('tr-TR')
  }));
  
  const csvContent = convertToCSV(csvData, headers);
  const filename = `sevkiyat-raporu-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * Export filtered data to CSV
 */
export const exportFilteredData = (data: any[], type: 'products' | 'shipments'): void => {
  if (type === 'products') {
    exportProductReport(data);
  } else {
    exportShipmentReport(data);
  }
};

/**
 * Export all data to CSV (for backup)
 */
export const exportAllData = (products: any[], shipments: any[]): void => {
  // Export products
  exportProductReport(products);
  
  // Wait a bit and export shipments
  setTimeout(() => {
    exportShipmentReport(shipments);
  }, 1000);
};
