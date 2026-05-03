import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute — redirects to /login if the user is not authenticated.
 * Preserves the current URL so the user is taken back after login.
 */
export const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * RoleRoute — redirects to / if the user does not have the required role.
 * Must be nested inside a ProtectedRoute (assumes user is already authenticated).
 */
export const RoleRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    // Redirect partners/users away from admin, etc.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
