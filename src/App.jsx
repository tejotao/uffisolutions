
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { getCurrentUserWithRole, onAuthStateChange } from '@/lib/supabaseAuth';
import { isSuperAdmin } from '@/lib/rolePermissions';

import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetail from '@/pages/ProductDetail';
import UserDashboard from '@/pages/UserDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminUsers from '@/pages/admin/AdminUsers';
import AccessBoard from '@/pages/admin/AccessBoard';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import BlockedPage from '@/pages/BlockedPage';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';

import '@/styles/globals.css';

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
        <title>UffiSolutions | Portal de Conhecimento</title>
        <meta name="description" content="Plataforma de treinamentos digitais e soluções." />
      </Helmet>
      <Router>
        {isPasswordRecovery ? (
          <ResetPasswordPage />
        ) : isBlocked ? (
          <BlockedPage />
        ) : (
        <Routes>
          <Route path="/"        element={user ? <Navigate to="/dashboard" replace /> : <HomePage user={user} />} />
          <Route path="/login"   element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/termos"       element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />

          <Route path="/products"     element={<ProductsPage user={user} />} />
          <Route path="/products/:id" element={<ProductDetail user={user} />} />

          <Route path="/dashboard" element={
            <ProtectedRoute user={user}><UserDashboard user={user} /></ProtectedRoute>
          } />

          <Route path="/admin"              element={<AdminRoute user={user}><AdminDashboard user={user} /></AdminRoute>} />
          <Route path="/admin/products"     element={<AdminRoute user={user}><AdminProducts user={user} /></AdminRoute>} />
          <Route path="/admin/categories"   element={<AdminRoute user={user}><AdminCategories user={user} /></AdminRoute>} />
          <Route path="/admin/users"        element={<AdminRoute user={user}><AdminUsers user={user} /></AdminRoute>} />
          <Route path="/admin/access-board" element={<AdminRoute user={user}><AccessBoard user={user} /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
