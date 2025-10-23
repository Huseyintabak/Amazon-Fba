-- Simple fix: Just grant access to the view
-- The frontend will handle admin-only access control

-- Drop and recreate view
DROP VIEW IF EXISTS admin_user_stats CASCADE;

CREATE VIEW admin_user_stats AS
SELECT 
    u.id,
    u.email,
    u.created_at as signed_up_at,
    u.last_sign_in_at,
    p.role,
    COALESCE(s.plan_type, 'free') as plan,
    s.status as subscription_status,
    COALESCE(ul.products_count, 0) as products_count,
    CASE 
        WHEN COALESCE(s.plan_type, 'free') = 'pro' THEN 999999
        ELSE 10
    END as products_limit,
    COALESCE(ul.shipments_count_monthly, 0) as shipments_this_month,
    CASE 
        WHEN COALESCE(s.plan_type, 'free') = 'pro' THEN 999999
        ELSE 5
    END as shipments_monthly_limit,
    (SELECT COUNT(*) FROM products WHERE user_id = u.id) as actual_products,
    (SELECT COUNT(*) FROM shipments WHERE user_id = u.id) as actual_shipments
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN usage_limits ul ON u.id = ul.user_id
ORDER BY u.created_at DESC;

-- Grant SELECT to authenticated users
GRANT SELECT ON admin_user_stats TO authenticated;
GRANT SELECT ON admin_user_stats TO anon;

-- Test
SELECT * FROM admin_user_stats;

