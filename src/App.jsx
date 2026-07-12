
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { getCurrentUserWithRole, onAuthStateChange } from '@/lib/supabaseAuth';
import { isSuperAdmin } from '@/lib/rolePermissions';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

// HomePage stays a static import — it's the entry point for the largest
// share of first-time (anonymous) visits, so it should paint with zero
// extra network round-trip. Every other route is lazy: anonymous visitors
// never pay for the admin bundle, and logged-in users never pay for the
// public marketing pages.
import HomePage from '@/pages/HomePage';

const ProductsPage      = lazy(() => import('@/pages/ProductsPage'));
const ProductDetail     = lazy(() => import('@/pages/ProductDetail'));
const UserDashboard     = lazy(() => import('@/pages/UserDashboard'));
const LibraryPage       = lazy(() => import('@/pages/LibraryPage'));
const AdminDashboard    = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts     = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminCategories   = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminUsers        = lazy(() => import('@/pages/admin/AdminUsers'));
const AccessBoard       = lazy(() => import('@/pages/admin/AccessBoard'));
const AdminSupport      = lazy(() => import('@/pages/admin/AdminSupport'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const LoginPage         = lazy(() => import('@/pages/LoginPage'));
const RegisterPage      = lazy(() => import('@/pages/RegisterPage'));
const BuyAuthPage       = lazy(() => import('@/pages/BuyAuthPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const BlockedPage       = lazy(() => import('@/pages/BlockedPage'));
const Terms             = lazy(() => import('@/pages/Terms'));
const Privacy           = lazy(() => import('@/pages/Privacy'));

import '@/styles/globals.css';

const RouteFallback = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]" />
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 3000);

    const subscription = onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (event === 'USER_UPDATED') {
        setIsPasswordRecovery(false);
      }
      try {
        if (session?.user) {
          const { data } = await getCurrentUserWithRole();
          if (data) {
            data.isSuperAdmin = isSuperAdmin(data?.email ?? '');
            setUser(data);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]" />
      </div>
    );
  }

  const isBlocked = user && user.status === 'blocked' && !user.isSuperAdmin;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Helmet>
        <title>UffiSolutions | Knowledge Portal</title>
        <meta name="description" content="Digital knowledge products and solutions for global entrepreneurs." />
      </Helmet>
      <Router>
        <Suspense fallback={<RouteFallback />}>
        {isPasswordRecovery ? (
          <ResetPasswordPage />
        ) : isBlocked ? (
          <BlockedPage />
        ) : (
        <Routes>
          <Route path="/"        element={user ? <Navigate to="/dashboard" replace /> : <HomePage user={user} />} />
          <Route path="/login"   element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/start"    element={user ? <Navigate to="/dashboard" replace /> : <BuyAuthPage />} />

          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/termos"       element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />

          <Route path="/products"     element={<ProductsPage user={user} />} />
          <Route path="/products/:id" element={<ProductDetail user={user} />} />

          <Route path="/dashboard" element={
            <ProtectedRoute user={user}><UserDashboard user={user} /></ProtectedRoute>
          } />
          <Route path="/library/:productId" element={
            <ProtectedRoute user={user}><LibraryPage user={user} /></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute user={user}><NotificationsPage user={user} /></ProtectedRoute>
          } />

          <Route path="/admin"              element={<AdminRoute user={user}><AdminDashboard user={user} /></AdminRoute>} />
          <Route path="/admin/products"     element={<AdminRoute user={user}><AdminProducts user={user} /></AdminRoute>} />
          <Route path="/admin/categories"   element={<AdminRoute user={user}><AdminCategories user={user} /></AdminRoute>} />
          <Route path="/admin/users"        element={<AdminRoute user={user}><AdminUsers user={user} /></AdminRoute>} />
          <Route path="/admin/access-board" element={<AdminRoute user={user}><AccessBoard user={user} /></AdminRoute>} />
          <Route path="/admin/support"      element={<AdminRoute user={user}><AdminSupport user={user} /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        )}
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
