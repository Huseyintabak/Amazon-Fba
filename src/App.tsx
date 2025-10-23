import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Shipments from './pages/Shipments';
import NewShipment from './pages/NewShipment';
import ShipmentDetail from './pages/ShipmentDetail';
import ProductDetail from './pages/ProductDetail';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import Suppliers from './pages/Suppliers';
import AIHub from './pages/AIHub';
import PurchaseOrders from './pages/PurchaseOrders';
import NewPurchaseOrder from './pages/NewPurchaseOrder';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import { initGA, trackPageView } from './lib/analytics';

// Wrapper component for ShipmentDetail to get params
const ShipmentDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <ShipmentDetail shipmentId={id || ''} />;
};

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Analytics page tracking component
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname + location.search, document.title);
  }, [location]);

  return null;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <>
      <AnalyticsTracker />
      <Routes>
        {/* Root redirects based on auth status */}
        <Route 
          path="/" 
          element={
            loading ? (
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Landing />
            )
          } 
        />

        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipments"
          element={
            <ProtectedRoute>
              <Layout>
                <Shipments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipments/new"
          element={
            <ProtectedRoute>
              <Layout>
                <NewShipment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipments/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ShipmentDetailWrapper />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shipments/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <NewShipment />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Admin />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Suppliers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-hub"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AIHub />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PurchaseOrders />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NewPurchaseOrder />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-orders/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PurchaseOrderDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* 404 redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  // Initialize Google Analytics on mount
  useEffect(() => {
    initGA();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;