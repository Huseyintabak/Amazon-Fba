-- ================================================
-- PROFIT CALCULATOR - DATABASE SCHEMA
-- ================================================
-- Add fields needed for profit calculation to products table

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS amazon_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_fee_percent NUMERIC DEFAULT 15,
ADD COLUMN IF NOT EXISTS fulfillment_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS advertising_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_profit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit_margin NUMERIC DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN products.amazon_price IS 'Amazon satış fiyatı';
COMMENT ON COLUMN products.referral_fee_percent IS 'Amazon referral fee yüzdesi (genelde %15)';
COMMENT ON COLUMN products.fulfillment_fee IS 'FBA fulfillment ücreti';
COMMENT ON COLUMN products.advertising_cost IS 'Reklam maliyeti (PPC)';
COMMENT ON COLUMN products.estimated_profit IS 'Tahmini kar (hesaplanan)';
COMMENT ON COLUMN products.profit_margin IS 'Kar marjı yüzdesi (hesaplanan)';

-- ================================================
-- PROFIT CALCULATION FUNCTION
-- ================================================
-- Function to calculate profit for a product

CREATE OR REPLACE FUNCTION calculate_product_profit(
    p_amazon_price NUMERIC,
    p_product_cost NUMERIC,
    p_referral_fee_percent NUMERIC,
    p_fulfillment_fee NUMERIC,
    p_advertising_cost NUMERIC DEFAULT 0
)
RETURNS TABLE (
    gross_revenue NUMERIC,
    referral_fee NUMERIC,
    total_costs NUMERIC,
    net_profit NUMERIC,
    profit_margin NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p_amazon_price as gross_revenue,
        (p_amazon_price * p_referral_fee_percent / 100) as referral_fee,
        (p_product_cost + p_fulfillment_fee + p_advertising_cost + (p_amazon_price * p_referral_fee_percent / 100)) as total_costs,
        (p_amazon_price - p_product_cost - p_fulfillment_fee - p_advertising_cost - (p_amazon_price * p_referral_fee_percent / 100)) as net_profit,
        CASE 
            WHEN p_amazon_price > 0 THEN
                ((p_amazon_price - p_product_cost - p_fulfillment_fee - p_advertising_cost - (p_amazon_price * p_referral_fee_percent / 100)) / p_amazon_price * 100)
            ELSE 0
        END as profit_margin;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================
-- TRIGGER TO AUTO-CALCULATE PROFIT
-- ================================================
-- Automatically calculate profit when product is updated

CREATE OR REPLACE FUNCTION update_product_profit()
RETURNS TRIGGER AS $$
DECLARE
    profit_calc RECORD;
BEGIN
    -- Calculate profit if we have the necessary data
    IF NEW.amazon_price > 0 THEN
        SELECT * INTO profit_calc
        FROM calculate_product_profit(
            COALESCE(NEW.amazon_price, 0),
            COALESCE(NEW.product_cost, 0),
            COALESCE(NEW.referral_fee_percent, 15),
            COALESCE(NEW.fulfillment_fee, 0),
            COALESCE(NEW.advertising_cost, 0)
        );
        
        NEW.estimated_profit := profit_calc.net_profit;
        NEW.profit_margin := profit_calc.profit_margin;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_update_product_profit ON products;

CREATE TRIGGER trigger_update_product_profit
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_profit();

-- ================================================
-- UPDATE EXISTING PRODUCTS
-- ================================================
-- Recalculate profit for existing products

UPDATE products
SET 
    amazon_price = COALESCE(amazon_price, 0),
    referral_fee_percent = COALESCE(referral_fee_percent, 15),
    fulfillment_fee = COALESCE(fulfillment_fee, 0),
    advertising_cost = COALESCE(advertising_cost, 0)
WHERE amazon_price IS NULL;

-- Force recalculation
UPDATE products SET updated_at = NOW() WHERE id IS NOT NULL;

-- ================================================
-- EXAMPLE USAGE
-- ================================================
/*
-- Calculate profit for a product
SELECT * FROM calculate_product_profit(
    29.99,  -- amazon_price
    8.50,   -- product_cost
    15,     -- referral_fee_percent
    3.50,   -- fulfillment_fee
    2.00    -- advertising_cost
);

-- Update a product and profit will auto-calculate
UPDATE products 
SET 
    amazon_price = 29.99,
    product_cost = 8.50,
    fulfillment_fee = 3.50,
    advertising_cost = 2.00
WHERE id = 'your-product-id';

-- View products with profit data
SELECT 
    name,
    asin,
    amazon_price,
    product_cost,
    fulfillment_fee,
    estimated_profit,
    profit_margin
FROM products
WHERE user_id = auth.uid()
ORDER BY profit_margin DESC;
*/

