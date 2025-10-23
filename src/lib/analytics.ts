import ReactGA from 'react-ga4';

// Google Analytics configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Initialize GA4
export const initGA = () => {
  if (GA_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // GDPR compliance
      },
    });
    console.log('📊 Google Analytics initialized');
  } else {
    console.log('📊 Google Analytics disabled (dev mode or no ID)');
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  if (GA_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.send({ hitType: 'pageview', page: path, title });
  }
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (GA_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Predefined tracking functions for common actions
export const analytics = {
  // Authentication events
  signUp: (method: 'email' | 'magic_link') => {
    trackEvent('Auth', 'Sign Up', method);
  },
  
  login: (method: 'email' | 'magic_link') => {
    trackEvent('Auth', 'Login', method);
  },
  
  logout: () => {
    trackEvent('Auth', 'Logout');
  },

  // Product events
  productCreated: (productName: string) => {
    trackEvent('Product', 'Create', productName);
  },
  
  productUpdated: (productId: string) => {
    trackEvent('Product', 'Update', productId);
  },
  
  productDeleted: (productId: string) => {
    trackEvent('Product', 'Delete', productId);
  },
  
  csvImport: (count: number) => {
    trackEvent('Product', 'CSV Import', 'Products Imported', count);
  },
  
  csvExport: (count: number) => {
    trackEvent('Product', 'CSV Export', 'Products Exported', count);
  },

  // Shipment events
  shipmentCreated: (shipmentId: string) => {
    trackEvent('Shipment', 'Create', shipmentId);
  },
  
  shipmentUpdated: (shipmentId: string) => {
    trackEvent('Shipment', 'Update', shipmentId);
  },
  
  shipmentCompleted: (shipmentId: string) => {
    trackEvent('Shipment', 'Complete', shipmentId);
  },

  // Subscription events
  viewPricing: () => {
    trackEvent('Subscription', 'View Pricing');
  },
  
  upgradePromptShown: (limitType: 'products' | 'shipments' | 'general') => {
    trackEvent('Subscription', 'Upgrade Prompt Shown', limitType);
  },
  
  upgradeClicked: (from: 'modal' | 'banner' | 'pricing') => {
    trackEvent('Subscription', 'Upgrade Clicked', from);
  },
  
  planUpgraded: (from: string, to: string) => {
    trackEvent('Subscription', 'Plan Upgraded', `${from} to ${to}`);
  },

  // Engagement events
  searchPerformed: (filters: string) => {
    trackEvent('Engagement', 'Search', filters);
  },
  
  sortApplied: (field: string, direction: 'asc' | 'desc') => {
    trackEvent('Engagement', 'Sort', `${field} ${direction}`);
  },
  
  reportViewed: (reportType: string) => {
    trackEvent('Engagement', 'Report Viewed', reportType);
  },

  // Error tracking
  error: (errorType: string, errorMessage: string) => {
    trackEvent('Error', errorType, errorMessage);
  },
};

// Set user properties
export const setUserProperties = (userId: string, email: string, plan: string) => {
  if (GA_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.set({
      userId,
      user_plan: plan,
      user_email_domain: email.split('@')[1], // Track domain for B2B insights
    });
  }
};

// Track timing (for performance monitoring)
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string
) => {
  if (GA_MEASUREMENT_ID && import.meta.env.PROD) {
    ReactGA.event({
      category: 'Timing',
      action: category,
      label: `${variable}${label ? ` - ${label}` : ''}`,
      value,
    });
  }
};

