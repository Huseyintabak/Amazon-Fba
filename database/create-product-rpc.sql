-- RPC Function to create product with automatic user_id
-- This bypasses the frontend session issues

CREATE OR REPLACE FUNCTION create_product_with_user(
  p_name TEXT,
  p_asin TEXT,
  p_merchant_sku TEXT,
  p_manufacturer_code TEXT DEFAULT NULL,
  p_manufacturer TEXT DEFAULT NULL,
  p_amazon_barcode TEXT DEFAULT NULL,
  p_product_cost NUMERIC DEFAULT 0
)
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
  v_plan TEXT;
BEGIN
  -- Get current authenticated user
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Check usage limits (free plan: 10 products)
  SELECT plan_type INTO v_plan
  FROM subscriptions
  WHERE user_id = v_user_id AND status = 'active';
  
  IF v_plan IS NULL THEN
    v_plan := 'free';
  END IF;
  
  IF v_plan = 'free' THEN
    SELECT COUNT(*) INTO v_count FROM products WHERE user_id = v_user_id;
    IF v_count >= 10 THEN
      RAISE EXCEPTION 'Product limit reached for free plan. Upgrade to Pro for unlimited products.';
    END IF;
  END IF;
  
  -- Insert and return product
  RETURN QUERY
  INSERT INTO products (
    user_id,
    name,
    asin,
    merchant_sku,
    manufacturer_code,
    manufacturer,
    amazon_barcode,
    product_cost
  ) VALUES (
    v_user_id,
    p_name,
    p_asin,
    p_merchant_sku,
    p_manufacturer_code,
    p_manufacturer,
    p_amazon_barcode,
    p_product_cost
  )
  RETURNING *;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_product_with_user TO authenticated;

