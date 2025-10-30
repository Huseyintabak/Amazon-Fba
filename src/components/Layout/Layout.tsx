import React, { useMemo } from 'react';
import Header from './Header';
import AIChatAssistant from '../AIChatAssistant';
import { useStore } from '../../stores/useStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { products, shipments } = useStore();

  // Calculate metrics for AI Chat
  const metrics = useMemo(() => {
    const totalRevenue = products.reduce((sum, p) => sum + ((p.revenue_generated || 0)), 0);
    const totalProfit = products.reduce((sum, p) => sum + (p.estimated_profit || 0), 0);
    const averageROI = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.roi_percentage || 0), 0) / products.length 
      : 0;

    return { totalRevenue, totalProfit, averageROI };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Global AI Chat Assistant - Available on all pages */}
      <AIChatAssistant
        products={products}
        shipments={shipments}
        totalRevenue={metrics.totalRevenue}
        totalProfit={metrics.totalProfit}
        averageROI={metrics.averageROI}
      />
    </div>
  );
};

export default Layout;