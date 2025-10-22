import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Shipments from './pages/Shipments';
import NewShipment from './pages/NewShipment';
import ShipmentDetail from './pages/ShipmentDetail';
import ProductDetail from './pages/ProductDetail';
import Reports from './pages/Reports';

// Wrapper component for ShipmentDetail to get params
const ShipmentDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ShipmentDetail shipmentId={id || ''} />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      setIsAuthenticated(!!authStatus);
      setIsLoading(false);
    };

    // Initial check
    checkAuthStatus();

    // Listen for storage changes (when login happens in another component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated') {
        checkAuthStatus();
      }
    };

    // Listen for custom events (for same-tab changes)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          {!isAuthenticated ? (
            <Login />
          ) : (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/shipments" element={<Shipments />} />
                <Route path="/shipments/new" element={<NewShipment />} />
                <Route path="/shipments/:id" element={<ShipmentDetailWrapper />} />
                <Route path="/shipments/:id/edit" element={<NewShipment />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                {/* Diğer route'lar buraya eklenecek */}
              </Routes>
            </Layout>
          )}
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;