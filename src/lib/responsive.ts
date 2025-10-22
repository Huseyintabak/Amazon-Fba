// Responsive utilities and mobile optimization helpers

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Device detection
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

// Touch detection
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Responsive class helpers
export const getResponsiveClasses = (base: string, mobile?: string, tablet?: string, desktop?: string): string => {
  let classes = base;
  
  if (mobile) classes += ` ${mobile}`;
  if (tablet) classes += ` md:${tablet}`;
  if (desktop) classes += ` lg:${desktop}`;
  
  return classes;
};

// Mobile-specific utilities
export const mobileUtils = {
  // Safe area for mobile devices
  safeArea: 'pb-safe-area-inset-bottom',
  
  // Touch-friendly button sizes
  touchButton: 'min-h-[44px] min-w-[44px]',
  
  // Mobile-optimized spacing
  mobileSpacing: 'px-4 py-3',
  
  // Mobile-optimized text sizes
  mobileText: 'text-sm md:text-base',
  
  // Mobile-optimized containers
  mobileContainer: 'max-w-full mx-auto px-4 sm:px-6 lg:px-8',
  
  // Mobile-optimized tables
  mobileTable: 'overflow-x-auto -mx-4 sm:mx-0',
  
  // Mobile-optimized forms
  mobileForm: 'space-y-4',
  
  // Mobile-optimized modals
  mobileModal: 'mx-4 sm:mx-auto max-w-sm sm:max-w-md'
};

// Viewport utilities
export const viewportUtils = {
  // Prevent zoom on input focus (iOS)
  preventZoom: 'text-base sm:text-sm',
  
  // Mobile viewport height
  mobileHeight: 'min-h-screen sm:min-h-0',
  
  // Mobile-optimized scrolling
  mobileScroll: 'overflow-y-auto overscroll-contain'
};

// Performance utilities for mobile
export const mobilePerformance = {
  // Reduce animations on low-end devices
  reducedMotion: 'motion-reduce:animate-none',
  
  // Optimize images for mobile
  mobileImage: 'w-full h-auto object-cover',
  
  // Lazy loading
  lazyLoad: 'loading="lazy"'
};

// Accessibility utilities
export const accessibilityUtils = {
  // Screen reader only
  srOnly: 'sr-only',
  
  // Focus visible
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  
  // High contrast
  highContrast: 'contrast-more:border-2 contrast-more:border-black',
  
  // Reduced motion
  reducedMotion: 'motion-reduce:transition-none motion-reduce:animate-none'
};

// Mobile-specific hooks
export const useMobileDetection = () => {
  const [isMobileDevice, setIsMobileDevice] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(isMobile());
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobileDevice;
};

// Import React for hooks
import React from 'react';
