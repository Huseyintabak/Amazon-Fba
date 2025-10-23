-- ================================================
-- PRODUCT-SUPPLIER LINK
-- ================================================
-- Add supplier relationship to products table

-- Add supplier_id column to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);

-- Add comment
COMMENT ON COLUMN products.supplier_id IS 'Tedarikçi ID - hangi tedarikçiden alındığı';

-- ================================================
-- VIEW: Products with Supplier Info
-- ================================================

CREATE OR REPLACE VIEW products_with_supplier AS
SELECT 
    p.*,
    s.name as supplier_name,
    s.company_name as supplier_company,
    s.country as supplier_country,
    s.lead_time_days as supplier_lead_time,
    s.rating as supplier_rating
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.id;

-- Grant permissions
GRANT SELECT ON products_with_supplier TO authenticated;

-- ================================================
-- EXAMPLE USAGE
-- ================================================
/*
-- Update a product with supplier
UPDATE products 
SET supplier_id = (SELECT id FROM suppliers WHERE name = 'Supplier A' LIMIT 1)
WHERE id = 'your-product-id';

-- View products with supplier info
SELECT 
    name,
    asin,
    product_cost,
    supplier_name,
    supplier_country,
    supplier_lead_time
FROM products_with_supplier
WHERE user_id = auth.uid()
ORDER BY name;
*/

