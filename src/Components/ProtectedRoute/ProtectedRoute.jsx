import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { Navigate, useNavigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = Cookies.get('token');

  useEffect(() => {
    // If no token, redirect to login
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Don't render children if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}