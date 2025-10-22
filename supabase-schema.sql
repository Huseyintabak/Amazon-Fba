-- =====================================================
-- Amazon FBA Sevkiyat Takip Sistemi - Supabase Schema
-- =====================================================
-- Bu dosya tüm veritabanı tablolarını, indeksleri, 
-- RLS politikalarını ve seed verilerini içerir.
-- Supabase SQL Editor'da tek seferde çalıştırılabilir.

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

-- UUID extension (gen_random_uuid için)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLES
-- =====================================================

-- Products Tablosu
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    asin TEXT UNIQUE NOT NULL,
    merchant_sku TEXT NOT NULL,
    manufacturer_code TEXT,
    manufacturer TEXT,
    amazon_barcode TEXT,
    product_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments Tablosu
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fba_shipment_id TEXT UNIQUE NOT NULL,
    shipment_date DATE NOT NULL,
    carrier_company TEXT NOT NULL,
    total_shipping_cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipment Items Tablosu
CREATE TABLE IF NOT EXISTS shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_shipping_cost DECIMAL(10,2) NOT NULL,
    barcode_scanned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INDEXES
-- =====================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_asin ON products(asin);
CREATE INDEX IF NOT EXISTS idx_products_merchant_sku ON products(merchant_sku);
CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON products(manufacturer);
CREATE INDEX IF NOT EXISTS idx_products_amazon_barcode ON products(amazon_barcode);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_fba_id ON shipments(fba_shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipments_date ON shipments(shipment_date);
CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier_company);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at);

-- Shipment Items indexes
CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment_id ON shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_product_id ON shipment_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_barcode_scanned ON shipment_items(barcode_scanned);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Products updated_at trigger
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Shipments updated_at trigger
CREATE TRIGGER update_shipments_updated_at 
    BEFORE UPDATE ON shipments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;

-- Products policies (herkese okuma, sadece authenticated kullanıcılara yazma)
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are insertable by authenticated users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by authenticated users" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Shipments policies
CREATE POLICY "Shipments are viewable by everyone" ON shipments
    FOR SELECT USING (true);

CREATE POLICY "Shipments are insertable by authenticated users" ON shipments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Shipments are updatable by authenticated users" ON shipments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Shipments are deletable by authenticated users" ON shipments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Shipment Items policies
CREATE POLICY "Shipment items are viewable by everyone" ON shipment_items
    FOR SELECT USING (true);

CREATE POLICY "Shipment items are insertable by authenticated users" ON shipment_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Shipment items are updatable by authenticated users" ON shipment_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Shipment items are deletable by authenticated users" ON shipment_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. VIEWS
-- =====================================================

-- Dashboard Stats View
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM shipments) as total_shipments,
    (SELECT COALESCE(SUM(quantity), 0) FROM shipment_items) as total_shipped_quantity,
    (SELECT COALESCE(SUM(total_shipping_cost), 0) FROM shipments) as total_shipping_cost;

-- Product Report View
CREATE OR REPLACE VIEW product_reports AS
SELECT 
    p.id,
    p.asin,
    p.name,
    p.manufacturer,
    p.product_cost,
    COALESCE(SUM(si.quantity), 0) as total_shipped,
    COALESCE(SUM(si.quantity * si.unit_shipping_cost), 0) as total_shipping_cost,
    COALESCE(AVG(si.unit_shipping_cost), 0) as avg_unit_cost,
    COUNT(DISTINCT s.id) as shipment_count,
    MAX(s.shipment_date) as last_shipment_date
FROM products p
LEFT JOIN shipment_items si ON p.id = si.product_id
LEFT JOIN shipments s ON si.shipment_id = s.id
GROUP BY p.id, p.asin, p.name, p.manufacturer, p.product_cost;

-- Monthly Shipment Data View
CREATE OR REPLACE VIEW monthly_shipment_data AS
SELECT 
    EXTRACT(YEAR FROM shipment_date) as year,
    EXTRACT(MONTH FROM shipment_date) as month,
    COUNT(*) as shipment_count,
    SUM(total_shipping_cost) as total_cost,
    SUM(COALESCE(si.total_quantity, 0)) as total_quantity
FROM shipments s
LEFT JOIN (
    SELECT 
        shipment_id, 
        SUM(quantity) as total_quantity 
    FROM shipment_items 
    GROUP BY shipment_id
) si ON s.id = si.shipment_id
GROUP BY EXTRACT(YEAR FROM shipment_date), EXTRACT(MONTH FROM shipment_date)
ORDER BY year, month;

-- Carrier Performance View
CREATE OR REPLACE VIEW carrier_performance AS
SELECT 
    carrier_company,
    COUNT(*) as shipment_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM shipments), 2) as percentage,
    SUM(total_shipping_cost) as total_cost,
    AVG(total_shipping_cost) as avg_cost
FROM shipments
GROUP BY carrier_company
ORDER BY shipment_count DESC;

-- =====================================================
-- 8. SEED DATA
-- =====================================================

-- Sample Products
INSERT INTO products (id, name, asin, merchant_sku, manufacturer_code, manufacturer, amazon_barcode, product_cost, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Wireless Bluetooth Headphones', 'B07KG5CBQ6', '2L-3RP4-NL31', 'BGE38', 'BROSS', '1234567890123', 25.99, '2024-01-15T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Smart Fitness Tracker', 'B08XYZ1234', 'FT-2024-001', 'FT001', 'FitTech', '2345678901234', 89.99, '2024-01-16T09:30:00Z'),
('550e8400-e29b-41d4-a716-446655440003', 'USB-C Charging Cable', 'B09ABC5678', 'USB-C-3FT', 'UC001', 'CablePro', '3456789012345', 12.99, '2024-01-17T14:20:00Z'),
('550e8400-e29b-41d4-a716-446655440004', 'Portable Power Bank', 'B10DEF9012', 'PB-10000', 'PB001', 'PowerMax', '4567890123456', 45.99, '2024-01-18T11:45:00Z'),
('550e8400-e29b-41d4-a716-446655440005', 'Bluetooth Speaker', 'B11GHI3456', 'BS-2024', 'BS001', 'SoundWave', '5678901234567', 65.99, '2024-01-19T16:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- Sample Shipments
INSERT INTO shipments (id, fba_shipment_id, shipment_date, carrier_company, total_shipping_cost, notes, status, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'FBA123456789', '2024-01-20', 'UPS', 45.50, 'Priority shipping for electronics', 'completed', '2024-01-20T08:30:00Z'),
('660e8400-e29b-41d4-a716-446655440002', 'FBA987654321', '2024-01-22', 'FedEx', 38.75, 'Standard shipping', 'completed', '2024-01-22T14:15:00Z'),
('660e8400-e29b-41d4-a716-446655440003', 'FBA555666777', '2024-01-25', 'DHL', 52.00, 'Express shipping for urgent orders', 'draft', '2024-01-25T11:20:00Z')
ON CONFLICT (id) DO NOTHING;

-- Sample Shipment Items
INSERT INTO shipment_items (id, shipment_id, product_id, quantity, unit_shipping_cost, barcode_scanned, created_at) VALUES
-- FBA123456789 items
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 5, 9.10, true, '2024-01-20T08:30:00Z'),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 10, 3.88, true, '2024-01-20T08:30:00Z'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 2, 7.76, false, '2024-01-20T08:30:00Z'),

-- FBA987654321 items
('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 3, 9.10, true, '2024-01-22T14:15:00Z'),
('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 8, 3.88, true, '2024-01-22T14:15:00Z'),
('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 1, 13.00, false, '2024-01-22T14:15:00Z'),

-- FBA555666777 items
('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', 4, 13.00, false, '2024-01-25T11:20:00Z')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. USEFUL QUERIES
-- =====================================================

-- Dashboard stats query
-- SELECT * FROM dashboard_stats;

-- Product reports query
-- SELECT * FROM product_reports ORDER BY total_shipped DESC;

-- Monthly data query
-- SELECT * FROM monthly_shipment_data ORDER BY year, month;

-- Carrier performance query
-- SELECT * FROM carrier_performance;

-- =====================================================
-- 10. CLEANUP (if needed)
-- =====================================================

-- Uncomment these lines if you need to clean up the database
-- DROP TABLE IF EXISTS shipment_items CASCADE;
-- DROP TABLE IF EXISTS shipments CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

-- Bu schema dosyası çalıştırıldıktan sonra:
-- 1. Supabase Dashboard'da Tables bölümünde tabloları görebilirsiniz
-- 2. RLS politikaları otomatik olarak aktif olacak
-- 3. Seed verileri yüklenecek
-- 4. Views ve functions hazır olacak
-- 5. Frontend uygulaması Supabase'e bağlanabilir

COMMIT;
