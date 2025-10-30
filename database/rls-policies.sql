-- =====================================================
-- Planet FBA Tracker - RLS Policy Audit & Fix
-- =====================================================
-- This migration adds missing RLS policies and ensures
-- all tables have proper Row Level Security enabled.

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

-- Enable RLS (already enabled but ensuring)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
DROP POLICY IF EXISTS "Admin can view all categories" ON categories;
DROP POLICY IF EXISTS "Admin can manage all categories" ON categories;

-- SELECT policy - users can only view their own categories
CREATE POLICY "Users can view own categories"
ON categories FOR SELECT
USING (
  user_id = auth.uid()
);

-- INSERT policy - users can only insert their own categories
CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

-- UPDATE policy - users can only update their own categories
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- DELETE policy - users can only delete their own categories
CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (
  user_id = auth.uid()
);

-- Admin can view all categories (using profiles.role = 'admin')
CREATE POLICY "Admin can view all categories"
ON categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- Admin can manage all categories (using profiles.role = 'admin')
CREATE POLICY "Admin can manage all categories"
ON categories FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================

-- Enable RLS (already enabled but ensuring)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admin can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Admin can manage all suppliers" ON suppliers;

-- SELECT policy - users can only view their own suppliers
CREATE POLICY "Users can view own suppliers"
ON suppliers FOR SELECT
USING (
  user_id = auth.uid()
);

-- INSERT policy - users can only insert their own suppliers
CREATE POLICY "Users can insert own suppliers"
ON suppliers FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

-- UPDATE policy - users can only update their own suppliers
CREATE POLICY "Users can update own suppliers"
ON suppliers FOR UPDATE
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- DELETE policy - users can only delete their own suppliers
CREATE POLICY "Users can delete own suppliers"
ON suppliers FOR DELETE
USING (
  user_id = auth.uid()
);

-- Admin can view all suppliers
CREATE POLICY "Admin can view all suppliers"
ON suppliers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- Admin can manage all suppliers
CREATE POLICY "Admin can manage all suppliers"
ON suppliers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR user_id = auth.uid()
);

-- =====================================================
-- PURCHASE ORDERS TABLE
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can insert own purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can update own purchase orders" ON purchase_orders;
DROP POLICY IF EXISTS "Users can delete own purchase orders" ON purchase_orders;

-- SELECT policy
CREATE POLICY "Users can view own purchase orders"
ON purchase_orders FOR SELECT
USING (
  user_id = auth.uid()
);

-- INSERT policy
CREATE POLICY "Users can insert own purchase orders"
ON purchase_orders FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

-- UPDATE policy
CREATE POLICY "Users can update own purchase orders"
ON purchase_orders FOR UPDATE
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- DELETE policy
CREATE POLICY "Users can delete own purchase orders"
ON purchase_orders FOR DELETE
USING (
  user_id = auth.uid()
);

-- =====================================================
-- PURCHASE ORDER ITEMS TABLE
-- =====================================================

-- Ensure RLS is enabled
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can insert own purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can update own purchase order items" ON purchase_order_items;
DROP POLICY IF EXISTS "Users can delete own purchase order items" ON purchase_order_items;

-- SELECT policy - users can view items from their purchase orders
CREATE POLICY "Users can view own purchase order items"
ON purchase_order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM purchase_orders
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id
    AND purchase_orders.user_id = auth.uid()
  )
);

-- INSERT policy
CREATE POLICY "Users can insert own purchase order items"
ON purchase_order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM purchase_orders
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id
    AND purchase_orders.user_id = auth.uid()
  )
);

-- UPDATE policy
CREATE POLICY "Users can update own purchase order items"
ON purchase_order_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM purchase_orders
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id
    AND purchase_orders.user_id = auth.uid()
  )
);

-- DELETE policy
CREATE POLICY "Users can delete own purchase order items"
ON purchase_order_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM purchase_orders
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id
    AND purchase_orders.user_id = auth.uid()
  )
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'products',
    'shipments',
    'shipment_items',
    'categories',
    'suppliers',
    'purchase_orders',
    'purchase_order_items',
    'profiles',
    'user_settings',
    'subscriptions',
    'usage_limits'
  )
ORDER BY tablename;

-- Check policies for categories table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'categories';

-- Check policies for suppliers table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'suppliers';

