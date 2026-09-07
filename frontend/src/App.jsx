import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import MemberApproval from './pages/MemberApproval';
import NHGManager from './pages/NHGManager';
import MeetingManager from './pages/MeetingManager';
import FinancialTracker from './pages/FinancialTracker';
import TrainingManager from './pages/TrainingManager';
import SchemeManager from './pages/SchemeManager';
import ProductManager from './pages/ProductManager';
import AdminOrders from './pages/AdminOrders';

// Member Pages
import MemberDashboard from './pages/MemberDashboard';
import MemberMeetings from './pages/MemberMeetings';
import MemberSavingsLoans from './pages/MemberSavingsLoans';
import MemberTrainings from './pages/MemberTrainings';
import MemberSchemes from './pages/MemberSchemes';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Notifications from './pages/Notifications';

// Protected Route Guard for Admin
const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)', color: 'var(--text-secondary)' }}>
        Loading Kudumbashree Session...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Protected Route Guard for Members
const MemberRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark-bg)', color: 'var(--text-secondary)' }}>
        Loading Kudumbashree Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Component to detect #admin in URL and navigate to login page or admin page
const HashRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  React.useEffect(() => {
    const handleHash = () => {
      const hash = (window.location.hash || location.hash || '').toLowerCase();
      if (hash === '#admin' || hash === '#/admin') {
        if (isAuthenticated && isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          if (location.pathname !== '/login' || location.hash !== '#admin') {
            navigate('/login#admin', { replace: true });
          }
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [location, navigate, isAuthenticated, isAdmin]);

  return null;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <HashRedirectHandler />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Protected Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/member-approval" element={<AdminRoute><MemberApproval /></AdminRoute>} />
              <Route path="/admin/nhg-manager" element={<AdminRoute><NHGManager /></AdminRoute>} />
              <Route path="/admin/meeting-manager" element={<AdminRoute><MeetingManager /></AdminRoute>} />
              <Route path="/admin/financial-tracker" element={<AdminRoute><FinancialTracker /></AdminRoute>} />
              <Route path="/admin/training-manager" element={<AdminRoute><TrainingManager /></AdminRoute>} />
              <Route path="/admin/scheme-manager" element={<AdminRoute><SchemeManager /></AdminRoute>} />
              <Route path="/admin/product-manager" element={<AdminRoute><ProductManager /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />

              {/* Member Protected Routes */}
              <Route path="/member" element={<MemberRoute><MemberDashboard /></MemberRoute>} />
              <Route path="/member/profile" element={<MemberRoute><Profile /></MemberRoute>} />
              <Route path="/member/meetings" element={<MemberRoute><MemberMeetings /></MemberRoute>} />
              <Route path="/member/savings-loans" element={<MemberRoute><MemberSavingsLoans /></MemberRoute>} />
              <Route path="/member/trainings" element={<MemberRoute><MemberTrainings /></MemberRoute>} />
              <Route path="/member/schemes" element={<MemberRoute><MemberSchemes /></MemberRoute>} />
              <Route path="/member/shop" element={<MemberRoute><Shop /></MemberRoute>} />
              <Route path="/member/cart" element={<MemberRoute><Cart /></MemberRoute>} />
              <Route path="/member/my-orders" element={<MemberRoute><MyOrders /></MemberRoute>} />
              <Route path="/member/notifications" element={<MemberRoute><Notifications /></MemberRoute>} />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
