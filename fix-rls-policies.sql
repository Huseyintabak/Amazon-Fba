-- =====================================================
-- Fix RLS Policies for Anonymous Access
-- =====================================================
-- Bu script RLS politikalarını anonymous erişim için düzeltir

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

DROP POLICY IF EXISTS "Shipments are insertable by authenticated users" ON shipments;
DROP POLICY IF EXISTS "Shipments are updatable by authenticated users" ON shipments;
DROP POLICY IF EXISTS "Shipments are deletable by authenticated users" ON shipments;

DROP POLICY IF EXISTS "Shipment items are insertable by authenticated users" ON shipment_items;
DROP POLICY IF EXISTS "Shipment items are updatable by authenticated users" ON shipment_items;
DROP POLICY IF EXISTS "Shipment items are deletable by authenticated users" ON shipment_items;

-- Yeni politikalar oluştur (herkese tam erişim)
CREATE POLICY "Products are insertable by everyone" ON products
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Products are updatable by everyone" ON products
    FOR UPDATE USING (true);

CREATE POLICY "Products are deletable by everyone" ON products
    FOR DELETE USING (true);

CREATE POLICY "Shipments are insertable by everyone" ON shipments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Shipments are updatable by everyone" ON shipments
    FOR UPDATE USING (true);

CREATE POLICY "Shipments are deletable by everyone" ON shipments
    FOR DELETE USING (true);

CREATE POLICY "Shipment items are insertable by everyone" ON shipment_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Shipment items are updatable by everyone" ON shipment_items
    FOR UPDATE USING (true);

CREATE POLICY "Shipment items are deletable by everyone" ON shipment_items
    FOR DELETE USING (true);

-- Alternatif olarak RLS'yi tamamen kapatmak isterseniz:
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE shipments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE shipment_items DISABLE ROW LEVEL SECURITY;
