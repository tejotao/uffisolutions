
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    console.log('⚠️ [Route] Acesso negado. Usuário não autenticado. Redirecionando...');
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
