-- ================================================
-- SUPPLIER MANAGEMENT - DATABASE SCHEMA
-- ================================================
-- Tables and functions for managing suppliers and purchase orders

-- ================================================
-- SUPPLIERS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(255),
    website VARCHAR(255),
    notes TEXT,
    payment_terms VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'USD',
    lead_time_days INTEGER DEFAULT 0,
    minimum_order_quantity INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

-- Add comments
COMMENT ON TABLE suppliers IS 'Supplier/vendor information for purchasing';
COMMENT ON COLUMN suppliers.user_id IS 'User who owns this supplier';
COMMENT ON COLUMN suppliers.lead_time_days IS 'Average lead time in days';
COMMENT ON COLUMN suppliers.minimum_order_quantity IS 'Minimum order quantity requirement';
COMMENT ON COLUMN suppliers.rating IS 'Supplier rating from 1-5 stars';

-- ================================================
-- PURCHASE ORDERS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    po_number VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(10, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(50) DEFAULT 'pending',
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, po_number)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date);

-- Add comments
COMMENT ON TABLE purchase_orders IS 'Purchase orders for products from suppliers';
COMMENT ON COLUMN purchase_orders.status IS 'Order status: draft, submitted, confirmed, shipped, received, cancelled';
COMMENT ON COLUMN purchase_orders.payment_status IS 'Payment status: pending, partial, paid, refunded';

-- ================================================
-- PURCHASE ORDER ITEMS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    received_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (received_quantity >= 0),
    CHECK (received_quantity <= quantity)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_po_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product_id ON purchase_order_items(product_id);

-- Add comments
COMMENT ON TABLE purchase_order_items IS 'Line items for each purchase order';
COMMENT ON COLUMN purchase_order_items.received_quantity IS 'Quantity received so far';

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Suppliers policies
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
CREATE POLICY "Users can view own suppliers"
    ON suppliers FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own suppliers" ON suppliers;
CREATE POLICY "Users can create own suppliers"
    ON suppliers FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
CREATE POLICY "Users can update own suppliers"
    ON suppliers FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
CREATE POLICY "Users can delete own suppliers"
    ON suppliers FOR DELETE
    USING (user_id = auth.uid());

-- Purchase orders policies
DROP POLICY IF EXISTS "Users can view own purchase orders" ON purchase_orders;
CREATE POLICY "Users can view own purchase orders"
    ON purchase_orders FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own purchase orders" ON purchase_orders;
CREATE POLICY "Users can create own purchase orders"
    ON purchase_orders FOR INSERT
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own purchase orders" ON purchase_orders;
CREATE POLICY "Users can update own purchase orders"
    ON purchase_orders FOR UPDATE
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own purchase orders" ON purchase_orders;
CREATE POLICY "Users can delete own purchase orders"
    ON purchase_orders FOR DELETE
    USING (user_id = auth.uid());

-- Purchase order items policies (through parent PO)
DROP POLICY IF EXISTS "Users can view own PO items" ON purchase_order_items;
CREATE POLICY "Users can view own PO items"
    ON purchase_order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_id
            AND po.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert own PO items" ON purchase_order_items;
CREATE POLICY "Users can insert own PO items"
    ON purchase_order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_id
            AND po.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own PO items" ON purchase_order_items;
CREATE POLICY "Users can update own PO items"
    ON purchase_order_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_id
            AND po.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own PO items" ON purchase_order_items;
CREATE POLICY "Users can delete own PO items"
    ON purchase_order_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM purchase_orders po
            WHERE po.id = purchase_order_id
            AND po.user_id = auth.uid()
        )
    );

-- ================================================
-- TRIGGERS
-- ================================================

-- Auto-update updated_at timestamp for suppliers
CREATE OR REPLACE FUNCTION update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_suppliers_updated_at ON suppliers;
CREATE TRIGGER trigger_update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_suppliers_updated_at();

-- Auto-update updated_at timestamp for purchase orders
CREATE OR REPLACE FUNCTION update_purchase_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER trigger_update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_purchase_orders_updated_at();

-- Auto-update PO total when items change
CREATE OR REPLACE FUNCTION update_po_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE purchase_orders
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM purchase_order_items
        WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
    )
    WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_po_total_insert ON purchase_order_items;
CREATE TRIGGER trigger_update_po_total_insert
    AFTER INSERT ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_po_total();

DROP TRIGGER IF EXISTS trigger_update_po_total_update ON purchase_order_items;
CREATE TRIGGER trigger_update_po_total_update
    AFTER UPDATE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_po_total();

DROP TRIGGER IF EXISTS trigger_update_po_total_delete ON purchase_order_items;
CREATE TRIGGER trigger_update_po_total_delete
    AFTER DELETE ON purchase_order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_po_total();

-- ================================================
-- VIEWS
-- ================================================

-- Supplier statistics view
CREATE OR REPLACE VIEW supplier_stats AS
SELECT
    s.id,
    s.user_id,
    s.name,
    s.company_name,
    s.rating,
    COUNT(DISTINCT po.id) as total_orders,
    SUM(CASE WHEN po.status = 'received' THEN 1 ELSE 0 END) as completed_orders,
    COALESCE(SUM(po.total_amount), 0) as total_spent,
    COALESCE(AVG(po.total_amount), 0) as avg_order_value,
    MAX(po.order_date) as last_order_date
FROM suppliers s
LEFT JOIN purchase_orders po ON s.id = po.supplier_id
GROUP BY s.id, s.user_id, s.name, s.company_name, s.rating;

-- Purchase order summary view
CREATE OR REPLACE VIEW po_summary AS
SELECT
    po.id,
    po.user_id,
    po.po_number,
    po.order_date,
    po.expected_delivery_date,
    po.status,
    po.payment_status,
    po.total_amount,
    po.currency,
    s.name as supplier_name,
    s.company_name as supplier_company,
    COUNT(poi.id) as item_count,
    SUM(poi.quantity) as total_quantity,
    SUM(poi.received_quantity) as total_received
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
GROUP BY po.id, po.user_id, po.po_number, po.order_date, po.expected_delivery_date, 
         po.status, po.payment_status, po.total_amount, po.currency, s.name, s.company_name;

-- Grant permissions on views
GRANT SELECT ON supplier_stats TO authenticated;
GRANT SELECT ON po_summary TO authenticated;

-- ================================================
-- EXAMPLE DATA
-- ================================================
/*
-- Add a sample supplier
INSERT INTO suppliers (user_id, name, company_name, email, country, payment_terms, rating)
VALUES (auth.uid(), 'Supplier A', 'Supplier A Inc.', 'contact@suppliera.com', 'China', 'Net 30', 5);

-- Add a sample purchase order
INSERT INTO purchase_orders (user_id, supplier_id, po_number, order_date, status)
VALUES (
    auth.uid(), 
    (SELECT id FROM suppliers WHERE user_id = auth.uid() LIMIT 1),
    'PO-2025-001',
    CURRENT_DATE,
    'draft'
);

-- Add sample PO items
INSERT INTO purchase_order_items (purchase_order_id, product_id, product_name, quantity, unit_price)
VALUES (
    (SELECT id FROM purchase_orders WHERE user_id = auth.uid() LIMIT 1),
    (SELECT id FROM products WHERE user_id = auth.uid() LIMIT 1),
    'Sample Product',
    100,
    5.50
);
*/

