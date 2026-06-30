import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect legacy route to new Rules page
const UKRules = () => {
  return <Navigate to="/rules" replace />;
};

export default UKRules;