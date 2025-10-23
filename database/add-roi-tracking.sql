-- ================================================
-- ROI TRACKING - DATABASE SCHEMA
-- ================================================
-- Add ROI tracking and advanced reporting capabilities

-- ================================================
-- EXTEND PRODUCTS TABLE
-- ================================================

-- Add ROI tracking fields
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS initial_investment NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS units_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_generated NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS roi_percentage NUMERIC DEFAULT 0;

-- Add comments
COMMENT ON COLUMN products.initial_investment IS 'İlk yatırım (ürün maliyeti × başlangıç stok miktarı)';
COMMENT ON COLUMN products.units_sold IS 'Satılan birim sayısı';
COMMENT ON COLUMN products.revenue_generated IS 'Elde edilen toplam gelir';
COMMENT ON COLUMN products.roi_percentage IS 'Yatırım getirisi yüzdesi';

-- ================================================
-- ROI CALCULATION FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION calculate_roi(
    p_initial_investment NUMERIC,
    p_revenue_generated NUMERIC,
    p_total_costs NUMERIC
)
RETURNS TABLE (
    net_profit NUMERIC,
    roi_percentage NUMERIC,
    roi_ratio NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (p_revenue_generated - p_total_costs) as net_profit,
        CASE 
            WHEN p_initial_investment > 0 THEN
                ((p_revenue_generated - p_total_costs) / p_initial_investment * 100)
            ELSE 0
        END as roi_percentage,
        CASE 
            WHEN p_initial_investment > 0 THEN
                ((p_revenue_generated - p_total_costs) / p_initial_investment)
            ELSE 0
        END as roi_ratio;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ================================================
-- PROFIT/LOSS VIEW
-- ================================================

CREATE OR REPLACE VIEW profit_loss_summary AS
SELECT
    u.id as user_id,
    DATE_TRUNC('month', p.created_at) as month,
    COUNT(DISTINCT p.id) as total_products,
    COALESCE(SUM(p.initial_investment), 0) as total_investment,
    COALESCE(SUM(p.revenue_generated), 0) as total_revenue,
    COALESCE(SUM(p.product_cost * COALESCE(p.units_sold, 0)), 0) as cost_of_goods_sold,
    COALESCE(SUM(s.total_shipping_cost), 0) as shipping_costs,
    COALESCE(SUM(p.revenue_generated - (p.product_cost * COALESCE(p.units_sold, 0))), 0) as gross_profit,
    COALESCE(SUM(p.estimated_profit * COALESCE(p.units_sold, 0)), 0) as net_profit,
    CASE 
        WHEN SUM(p.revenue_generated) > 0 THEN
            (SUM(p.revenue_generated - (p.product_cost * COALESCE(p.units_sold, 0))) / SUM(p.revenue_generated) * 100)
        ELSE 0
    END as profit_margin_percentage
FROM auth.users u
LEFT JOIN products p ON u.id = p.user_id
LEFT JOIN shipments s ON u.id = s.user_id AND DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', p.created_at)
WHERE p.id IS NOT NULL
GROUP BY u.id, DATE_TRUNC('month', p.created_at);

-- Grant permissions
GRANT SELECT ON profit_loss_summary TO authenticated;

-- ================================================
-- COST BREAKDOWN VIEW
-- ================================================

CREATE OR REPLACE VIEW cost_breakdown AS
SELECT
    p.user_id,
    p.id as product_id,
    p.name as product_name,
    p.product_cost,
    p.fulfillment_fee,
    p.advertising_cost,
    (p.amazon_price * p.referral_fee_percent / 100) as referral_fee,
    (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) as total_cost,
    p.estimated_profit,
    p.profit_margin,
    -- Cost percentages
    CASE 
        WHEN (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) > 0 THEN
            (p.product_cost / (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) * 100)
        ELSE 0
    END as product_cost_percentage,
    CASE 
        WHEN (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) > 0 THEN
            (p.fulfillment_fee / (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) * 100)
        ELSE 0
    END as fulfillment_cost_percentage,
    CASE 
        WHEN (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) > 0 THEN
            (p.advertising_cost / (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) * 100)
        ELSE 0
    END as advertising_cost_percentage,
    CASE 
        WHEN (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) > 0 THEN
            ((p.amazon_price * p.referral_fee_percent / 100) / (p.product_cost + p.fulfillment_fee + p.advertising_cost + (p.amazon_price * p.referral_fee_percent / 100)) * 100)
        ELSE 0
    END as referral_fee_percentage
FROM products p
WHERE p.amazon_price > 0;

-- Grant permissions
GRANT SELECT ON cost_breakdown TO authenticated;

-- ================================================
-- ROI PERFORMANCE VIEW
-- ================================================

CREATE OR REPLACE VIEW roi_performance AS
SELECT
    p.user_id,
    p.id as product_id,
    p.name as product_name,
    p.initial_investment,
    p.units_sold,
    p.revenue_generated,
    (p.product_cost * p.units_sold) + COALESCE(p.fulfillment_fee * p.units_sold, 0) as total_costs,
    p.revenue_generated - ((p.product_cost * p.units_sold) + COALESCE(p.fulfillment_fee * p.units_sold, 0)) as net_profit,
    CASE 
        WHEN p.initial_investment > 0 THEN
            ((p.revenue_generated - ((p.product_cost * p.units_sold) + COALESCE(p.fulfillment_fee * p.units_sold, 0))) / p.initial_investment * 100)
        ELSE 0
    END as roi_percentage,
    s.name as supplier_name,
    s.country as supplier_country
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.initial_investment > 0 OR p.units_sold > 0;

-- Grant permissions
GRANT SELECT ON roi_performance TO authenticated;

-- ================================================
-- EXAMPLE USAGE
-- ================================================
/*
-- Calculate ROI for a product
SELECT * FROM calculate_roi(
    1000,  -- initial_investment
    3000,  -- revenue_generated
    1500   -- total_costs
);
-- Result: net_profit = 1500, roi_percentage = 150%, roi_ratio = 1.5

-- View profit/loss summary
SELECT * FROM profit_loss_summary
WHERE user_id = auth.uid()
ORDER BY month DESC;

-- View cost breakdown
SELECT * FROM cost_breakdown
WHERE user_id = auth.uid()
ORDER BY total_cost DESC;

-- View ROI performance
SELECT * FROM roi_performance
WHERE user_id = auth.uid()
ORDER BY roi_percentage DESC;
*/

