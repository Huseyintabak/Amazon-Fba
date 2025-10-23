-- =====================================================
-- CRITICAL FIX: ENABLE ROW LEVEL SECURITY
-- =====================================================
-- This SQL script enables RLS on all tables to fix the security issue
-- where users can see other users' data.
--
-- RUN THIS IMMEDIATELY IN SUPABASE SQL EDITOR!
-- =====================================================

-- Enable RLS on all main tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled (should all show 't' for true)
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'shipments', 'shipment_items', 'profiles', 'subscriptions', 'usage_limits')
ORDER BY tablename;

-- Expected output:
-- | tablename       | rls_enabled |
-- |-----------------|-------------|
-- | products        | t           |
-- | profiles        | t           |
-- | shipment_items  | t           |
-- | shipments       | t           |
-- | subscriptions   | t           |
-- | usage_limits    | t           |

