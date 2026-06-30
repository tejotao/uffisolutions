import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to home if someone tries to access dashboard
const Dashboard = () => {
  return <Navigate to="/" replace />;
};

export default Dashboard;