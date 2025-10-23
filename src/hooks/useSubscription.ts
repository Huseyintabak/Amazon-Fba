import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface UsageLimits {
  id: string;
  user_id: string;
  products_count: number;
  shipments_count_monthly: number;
  last_reset_date: string;
}

export interface PlanLimits {
  products: number;
  shipmentsPerMonth: number;
  csvExport: boolean;
  advancedReports: boolean;
  prioritySupport: boolean;
}

const PLAN_LIMITS: Record<'free' | 'pro', PlanLimits> = {
  free: {
    products: 10,
    shipmentsPerMonth: 5,
    csvExport: false,
    advancedReports: false,
    prioritySupport: false,
  },
  pro: {
    products: Infinity,
    shipmentsPerMonth: Infinity,
    csvExport: true,
    advancedReports: true,
    prioritySupport: true,
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSubscriptionData = async () => {
      try {
        // Fetch subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subError) {
          console.error('Error fetching subscription:', subError);
        } else {
          setSubscription(subData);
        }

        // Fetch usage limits
        const { data: usageData, error: usageError } = await supabase
          .from('usage_limits')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (usageError) {
          console.error('Error fetching usage:', usageError);
        } else {
          setUsage(usageData);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();

    // Subscribe to realtime changes
    const subscriptionChannel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setSubscription(payload.new as Subscription);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_limits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setUsage(payload.new as UsageLimits);
        }
      )
      .subscribe();

    return () => {
      subscriptionChannel.unsubscribe();
    };
  }, [user]);

  const planType = subscription?.plan_type || 'free';
  const limits = PLAN_LIMITS[planType];

  const canCreateProduct = () => {
    if (!usage) return false;
    return usage.products_count < limits.products;
  };

  const canCreateShipment = () => {
    if (!usage) return false;
    return usage.shipments_count_monthly < limits.shipmentsPerMonth;
  };

  const hasFeature = (feature: keyof PlanLimits) => {
    return limits[feature] as boolean;
  };

  const isProUser = () => {
    return planType === 'pro' && subscription?.status === 'active';
  };

  const getProductsRemaining = () => {
    if (!usage) return 0;
    if (limits.products === Infinity) return Infinity;
    return Math.max(0, limits.products - usage.products_count);
  };

  const getShipmentsRemaining = () => {
    if (!usage) return 0;
    if (limits.shipmentsPerMonth === Infinity) return Infinity;
    return Math.max(0, limits.shipmentsPerMonth - usage.shipments_count_monthly);
  };

  const getUsagePercentage = (type: 'products' | 'shipments') => {
    if (!usage) return 0;
    
    if (type === 'products') {
      if (limits.products === Infinity) return 0;
      return (usage.products_count / limits.products) * 100;
    } else {
      if (limits.shipmentsPerMonth === Infinity) return 0;
      return (usage.shipments_count_monthly / limits.shipmentsPerMonth) * 100;
    }
  };

  return {
    subscription,
    usage,
    loading,
    planType,
    limits,
    canCreateProduct,
    canCreateShipment,
    hasFeature,
    isProUser,
    getProductsRemaining,
    getShipmentsRemaining,
    getUsagePercentage,
  };
};

