// CSV Import Utility Functions

/**
 * Parse CSV content to array of objects
 */
export const parseCSV = (csvContent: string): any[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }
  
  return data;
};

/**
 * Validate product data from CSV
 */
export const validateProductData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = ['Ürün Adı', 'ASIN', 'Merchant SKU'];
  requiredFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`${field} alanı zorunludur`);
    }
  });
  
  // Validate ASIN format (should start with B and be 10 characters)
  if (data['ASIN'] && !/^B[0-9A-Z]{9}$/.test(data['ASIN'])) {
    errors.push('ASIN formatı geçersiz (B ile başlamalı ve 10 karakter olmalı)');
  }
  
  // Validate Merchant SKU format
  if (data['Merchant SKU'] && data['Merchant SKU'].length < 3) {
    errors.push('Merchant SKU en az 3 karakter olmalı');
  }
  
  // Validate product cost if provided
  if (data['Ürün Maliyeti'] && isNaN(parseFloat(data['Ürün Maliyeti']))) {
    errors.push('Ürün Maliyeti geçerli bir sayı olmalı');
  }
  
  // Validate Amazon barcode if provided (should be 10 digits)
  if (data['Amazon Barkod'] && !/^[0-9]{10}$/.test(data['Amazon Barkod'])) {
    errors.push('Amazon Barkod 10 haneli sayı olmalı');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Convert CSV data to Product object
 */
export const csvToProduct = (data: any, existingProducts: any[]): any => {
  // Generate unique ID
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  // Check for duplicate ASIN
  const isDuplicateASIN = existingProducts.some(p => p.asin === data['ASIN']);
  if (isDuplicateASIN) {
    throw new Error(`ASIN ${data['ASIN']} zaten mevcut`);
  }
  
  // Check for duplicate Merchant SKU
  const isDuplicateSKU = existingProducts.some(p => p.merchant_sku === data['Merchant SKU']);
  if (isDuplicateSKU) {
    throw new Error(`Merchant SKU ${data['Merchant SKU']} zaten mevcut`);
  }
  
  return {
    id,
    name: data['Ürün Adı'] || '',
    asin: data['ASIN'] || '',
    merchant_sku: data['Merchant SKU'] || '',
    manufacturer_code: data['Üretici Kodu'] || '',
    manufacturer: data['Üretici'] || '',
    amazon_barcode: data['Amazon Barkod'] || '',
    product_cost: data['Ürün Maliyeti'] ? parseFloat(data['Ürün Maliyeti']) : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

/**
 * Process CSV file and return products
 */
export const processCSVFile = (file: File, existingProducts: any[]): Promise<{
  success: boolean;
  products: any[];
  errors: string[];
  duplicates: string[];
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const csvData = parseCSV(csvContent);
        
        if (csvData.length === 0) {
          resolve({
            success: false,
            products: [],
            errors: ['CSV dosyası boş veya geçersiz format'],
            duplicates: []
          });
          return;
        }
        
        const products: any[] = [];
        const errors: string[] = [];
        const duplicates: string[] = [];
        
        csvData.forEach((row, index) => {
          try {
            const validation = validateProductData(row);
            if (!validation.isValid) {
              errors.push(`Satır ${index + 2}: ${validation.errors.join(', ')}`);
              return;
            }
            
            const product = csvToProduct(row, existingProducts);
            products.push(product);
          } catch (error) {
            if (error instanceof Error) {
              if (error.message.includes('zaten mevcut')) {
                duplicates.push(`Satır ${index + 2}: ${error.message}`);
              } else {
                errors.push(`Satır ${index + 2}: ${error.message}`);
              }
            }
          }
        });
        
        resolve({
          success: products.length > 0,
          products,
          errors,
          duplicates
        });
      } catch (error) {
        resolve({
          success: false,
          products: [],
          errors: ['CSV dosyası işlenirken hata oluştu'],
          duplicates: []
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        products: [],
        errors: ['Dosya okunamadı'],
        duplicates: []
      });
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * Get CSV template for download
 */
export const getCSVTemplate = (): string => {
  const headers = [
    'Ürün Adı',
    'ASIN',
    'Merchant SKU',
    'Üretici',
    'Üretici Kodu',
    'Amazon Barkod',
    'Ürün Maliyeti'
  ];
  
  const sampleData = [
    'Örnek Ürün',
    'B123456789',
    'SKU-001',
    'Örnek Üretici',
    'M001',
    '1234567890123',
    '25.99'
  ];
  
  return [headers.join(','), sampleData.join(',')].join('\n');
};
