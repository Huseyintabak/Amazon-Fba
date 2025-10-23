-- ================================================
-- REMOVE MANUFACTURER FIELD FROM PRODUCTS
-- ================================================
-- Remove the manufacturer column as it's replaced by supplier

-- Drop the manufacturer column
ALTER TABLE products 
DROP COLUMN IF EXISTS manufacturer;

-- Update the view to remove manufacturer reference
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

-- Note: manufacturer_code is kept as it's still used (optional field)
COMMENT ON COLUMN products.manufacturer_code IS 'Üretici kodu (opsiyonel)';

