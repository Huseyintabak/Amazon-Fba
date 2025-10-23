-- Admin function to gift premium subscription to a user
-- This allows admins to manually upgrade users to Pro plan

CREATE OR REPLACE FUNCTION admin_gift_premium(
    p_user_id UUID,
    p_duration_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
    v_end_date TIMESTAMPTZ;
    v_result JSON;
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Calculate end date
    v_end_date := NOW() + (p_duration_days || ' days')::INTERVAL;
    
    -- Update or insert subscription
    INSERT INTO subscriptions (user_id, plan_type, status, current_period_start, current_period_end, stripe_subscription_id)
    VALUES (p_user_id, 'pro', 'active', NOW(), v_end_date, 'ADMIN_GIFT')
    ON CONFLICT (user_id) 
    DO UPDATE SET
        plan_type = 'pro',
        status = 'active',
        current_period_start = NOW(),
        current_period_end = v_end_date,
        stripe_subscription_id = 'ADMIN_GIFT',
        updated_at = NOW();
    
    -- Update usage limits to Pro
    UPDATE usage_limits
    SET 
        products_count = 0,
        shipments_count_monthly = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return success message
    v_result := json_build_object(
        'success', true,
        'message', 'Premium subscription gifted successfully',
        'user_id', p_user_id,
        'plan', 'pro',
        'expires_at', v_end_date
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION admin_gift_premium(UUID, INTEGER) TO authenticated;

-- Test function (replace with actual user ID)
-- SELECT admin_gift_premium('bb82d8a8-75f4-4e56-a577-48c0fbd61ac4', 30);


-- Admin function to revoke premium (downgrade to free)
CREATE OR REPLACE FUNCTION admin_revoke_premium(
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;
    
    -- Update subscription to free
    UPDATE subscriptions
    SET 
        plan_type = 'free',
        status = 'active',
        current_period_end = NULL,
        stripe_subscription_id = NULL,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Reset usage limits to free tier
    UPDATE usage_limits
    SET 
        products_count = LEAST(products_count, 10),
        shipments_count_monthly = LEAST(shipments_count_monthly, 5),
        last_reset_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Return success message
    v_result := json_build_object(
        'success', true,
        'message', 'Premium subscription revoked successfully',
        'user_id', p_user_id,
        'plan', 'free'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION admin_revoke_premium(UUID) TO authenticated;

-- Verify functions exist
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name IN ('admin_gift_premium', 'admin_revoke_premium')
AND routine_schema = 'public';

