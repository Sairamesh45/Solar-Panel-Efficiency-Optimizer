import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, token } = useAuthContext();

  if (loading) {
    return <Loader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

