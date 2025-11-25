import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  // Check if admin-only route and user is not admin
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Check if regular user route and user is admin (redirect admin to admin dashboard)
  if (!adminOnly && user.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
