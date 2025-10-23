-- =====================================================
-- Amazon FBA Tracker - SaaS Platform Schema
-- =====================================================
-- Multi-tenant SaaS architecture with Supabase Auth
-- Run this after the base schema or as a migration

-- =====================================================
-- 1. USER PROFILES & SETTINGS
-- =====================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    language TEXT DEFAULT 'tr',
    timezone TEXT DEFAULT 'Europe/Istanbul',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SUBSCRIPTION & BILLING
-- =====================================================

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro')) DEFAULT 'free',
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage limits tracking
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    products_count INTEGER DEFAULT 0,
    shipments_count_monthly INTEGER DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. MODIFY EXISTING TABLES FOR MULTI-TENANCY
-- =====================================================

-- Add user_id to products table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'user_id') THEN
        ALTER TABLE products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
    END IF;
END $$;

-- Add user_id to shipments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'shipments' AND column_name = 'user_id') THEN
        ALTER TABLE shipments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON shipments(user_id);
    END IF;
END $$;

-- =====================================================
-- 4. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) - Multi-Tenancy
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
CREATE POLICY "Users can insert own subscription" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage limits policies
DROP POLICY IF EXISTS "Users can view own usage" ON usage_limits;
CREATE POLICY "Users can view own usage" ON usage_limits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON usage_limits;
CREATE POLICY "Users can update own usage" ON usage_limits
    FOR UPDATE USING (auth.uid() = user_id);

-- Update Products RLS policies for multi-tenancy
-- CRITICAL: Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are updatable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products are deletable by authenticated users" ON products;

CREATE POLICY "Users can view own products" ON products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- Update Shipments RLS policies for multi-tenancy
-- CRITICAL: Enable RLS on shipments table
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shipments are viewable by everyone" ON shipments;
DROP POLICY IF EXISTS "Shipments are insertable by authenticated users" ON shipments;
DROP POLICY IF EXISTS "Shipments are updatable by authenticated users" ON shipments;
DROP POLICY IF EXISTS "Shipments are deletable by authenticated users" ON shipments;

CREATE POLICY "Users can view own shipments" ON shipments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipments" ON shipments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipments" ON shipments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipments" ON shipments
    FOR DELETE USING (auth.uid() = user_id);

-- Update Shipment Items RLS policies (via shipment relationship)
-- CRITICAL: Enable RLS on shipment_items table
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shipment items are viewable by everyone" ON shipment_items;
DROP POLICY IF EXISTS "Shipment items are insertable by authenticated users" ON shipment_items;
DROP POLICY IF EXISTS "Shipment items are updatable by authenticated users" ON shipment_items;
DROP POLICY IF EXISTS "Shipment items are deletable by authenticated users" ON shipment_items;

CREATE POLICY "Users can view own shipment items" ON shipment_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM shipments 
            WHERE shipments.id = shipment_items.shipment_id 
            AND shipments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own shipment items" ON shipment_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM shipments 
            WHERE shipments.id = shipment_items.shipment_id 
            AND shipments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own shipment items" ON shipment_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM shipments 
            WHERE shipments.id = shipment_items.shipment_id 
            AND shipments.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own shipment items" ON shipment_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM shipments 
            WHERE shipments.id = shipment_items.shipment_id 
            AND shipments.user_id = auth.uid()
        )
    );

-- =====================================================
-- 6. FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.subscriptions (user_id, plan_type, status)
    VALUES (NEW.id, 'free', 'active');
    
    INSERT INTO public.usage_limits (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update profiles updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment product count
CREATE OR REPLACE FUNCTION increment_product_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usage_limits 
    SET products_count = products_count + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement product count
CREATE OR REPLACE FUNCTION decrement_product_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usage_limits 
    SET products_count = GREATEST(0, products_count - 1)
    WHERE user_id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Triggers for product count
DROP TRIGGER IF EXISTS increment_product_count_trigger ON products;
CREATE TRIGGER increment_product_count_trigger
    AFTER INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION increment_product_count();

DROP TRIGGER IF EXISTS decrement_product_count_trigger ON products;
CREATE TRIGGER decrement_product_count_trigger
    AFTER DELETE ON products
    FOR EACH ROW
    EXECUTE FUNCTION decrement_product_count();

-- Function to increment shipment count
CREATE OR REPLACE FUNCTION increment_shipment_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE usage_limits 
    SET shipments_count_monthly = shipments_count_monthly + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for shipment count
DROP TRIGGER IF EXISTS increment_shipment_count_trigger ON shipments;
CREATE TRIGGER increment_shipment_count_trigger
    AFTER INSERT ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION increment_shipment_count();

-- Function to check and enforce usage limits
CREATE OR REPLACE FUNCTION check_usage_limits()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_type TEXT;
    v_products_count INTEGER;
    v_shipments_count INTEGER;
BEGIN
    -- Get user's plan and current usage
    SELECT s.plan_type, ul.products_count, ul.shipments_count_monthly
    INTO v_plan_type, v_products_count, v_shipments_count
    FROM subscriptions s
    JOIN usage_limits ul ON s.user_id = ul.user_id
    WHERE s.user_id = NEW.user_id;
    
    -- Check limits for free plan
    IF v_plan_type = 'free' THEN
        IF TG_TABLE_NAME = 'products' AND v_products_count >= 10 THEN
            RAISE EXCEPTION 'Product limit reached for free plan. Upgrade to Pro for unlimited products.';
        END IF;
        
        IF TG_TABLE_NAME = 'shipments' AND v_shipments_count >= 5 THEN
            RAISE EXCEPTION 'Monthly shipment limit reached for free plan. Upgrade to Pro for unlimited shipments.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for usage limit checks
DROP TRIGGER IF EXISTS check_product_limit_trigger ON products;
CREATE TRIGGER check_product_limit_trigger
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION check_usage_limits();

DROP TRIGGER IF EXISTS check_shipment_limit_trigger ON shipments;
CREATE TRIGGER check_shipment_limit_trigger
    BEFORE INSERT ON shipments
    FOR EACH ROW
    EXECUTE FUNCTION check_usage_limits();

-- Function to reset monthly shipment counts
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
    UPDATE usage_limits
    SET shipments_count_monthly = 0,
        last_reset_date = CURRENT_DATE
    WHERE last_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VIEWS (Updated for multi-tenancy)
-- =====================================================

-- Dashboard Stats View (per user) - FIX: Return row even if no products
-- WITH RLS: Only show current user's stats
DROP VIEW IF EXISTS dashboard_stats;
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    u.id as user_id,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT s.id) as total_shipments,
    COALESCE(SUM(si.quantity), 0) as total_shipped_quantity,
    COALESCE(SUM(s.total_shipping_cost), 0) as total_shipping_cost
FROM auth.users u
LEFT JOIN products p ON u.id = p.user_id
LEFT JOIN shipments s ON u.id = s.user_id
LEFT JOIN shipment_items si ON s.id = si.shipment_id
WHERE u.id = auth.uid()  -- CRITICAL: Only show current user's data
GROUP BY u.id;

-- Product Report View (per user)
DROP VIEW IF EXISTS product_reports;
CREATE OR REPLACE VIEW product_reports AS
SELECT 
    p.id,
    p.user_id,
    p.asin,
    p.name,
    p.manufacturer,
    p.product_cost,
    COALESCE(SUM(si.quantity), 0) as total_shipped,
    COALESCE(SUM(si.quantity * si.unit_shipping_cost), 0) as total_shipping_cost,
    COALESCE(AVG(si.unit_shipping_cost), 0) as avg_unit_cost,
    COUNT(DISTINCT s.id) as shipment_count,
    MAX(s.shipment_date) as last_shipment_date
FROM products p
LEFT JOIN shipment_items si ON p.id = si.product_id
LEFT JOIN shipments s ON si.shipment_id = s.id AND s.user_id = p.user_id
GROUP BY p.id, p.user_id, p.asin, p.name, p.manufacturer, p.product_cost;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's subscription plan
CREATE OR REPLACE FUNCTION get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_plan TEXT;
BEGIN
    SELECT plan_type INTO v_plan
    FROM subscriptions
    WHERE user_id = p_user_id AND status = 'active';
    
    RETURN COALESCE(v_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_user_perform_action(
    p_user_id UUID,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan TEXT;
    v_usage usage_limits%ROWTYPE;
BEGIN
    v_plan := get_user_plan(p_user_id);
    
    IF v_plan = 'pro' THEN
        RETURN TRUE;
    END IF;
    
    SELECT * INTO v_usage FROM usage_limits WHERE user_id = p_user_id;
    
    CASE p_action
        WHEN 'create_product' THEN
            RETURN v_usage.products_count < 10;
        WHEN 'create_shipment' THEN
            RETURN v_usage.shipments_count_monthly < 5;
        ELSE
            RETURN TRUE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. VIEW RLS POLICIES
-- =====================================================

-- Enable RLS on views (Supabase automatically creates tables for materialized views)
-- For regular views, RLS is inherited from underlying tables

-- RLS policies for profiles (if not already set)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
CREATE POLICY "Users can update own subscription" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for usage_limits
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage limits" ON usage_limits;
CREATE POLICY "Users can view own usage limits" ON usage_limits
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 10. ADMIN POLICIES
-- =====================================================

-- Admins can view all data
CREATE POLICY "Admins can view all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can view all shipments" ON shipments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = TRUE
        )
    );

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================

COMMIT;

