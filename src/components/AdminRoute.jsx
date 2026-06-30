
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES, getUserRole } from '@/lib/rolePermissions';

const AdminRoute = ({ user, children }) => {
  if (!user) {
    console.log('⚠️ [AdminRoute] Acesso negado. Usuário não autenticado. Redirecionando...');
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole(user);
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN) {
    console.log('⚠️ [AdminRoute] Acesso negado. Privilégios insuficientes. Redirecionando...');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
