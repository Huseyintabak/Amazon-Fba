-- Add admin role to profiles table

-- Add role column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Make your account admin (replace with your email)
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'huseyintabak1@gmail.com'
);

-- Verify
SELECT 
    p.id,
    u.email,
    p.role,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin stats view
CREATE OR REPLACE VIEW admin_user_stats AS
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

-- RLS policy for admin view (only admins can see)
ALTER VIEW admin_user_stats SET (security_invoker = on);

-- Test admin function
SELECT is_admin();
-- Expected: true for your account, false for others

