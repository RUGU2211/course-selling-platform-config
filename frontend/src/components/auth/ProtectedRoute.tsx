import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
  requireEmailVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallbackPath = '/auth/login',
  requireEmailVerification = false,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Verifying authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check email verification if required
  if (requireEmailVerification && !user.emailVerified) {
    return (
      <Navigate
        to="/auth/verify-email"
        state={{ 
          from: location,
          email: user.email,
          message: 'Please verify your email address to access this page.'
        }}
        replace
      />
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    // Redirect based on user role
    const redirectPath = getUserDefaultPath(user.role);
    return (
      <Navigate
        to={redirectPath}
        state={{ 
          from: location,
          message: 'You do not have permission to access this page.'
        }}
        replace
      />
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

// Helper function to get default path based on user role
const getUserDefaultPath = (role: string): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'INSTRUCTOR':
      return '/instructor/dashboard';
    case 'STUDENT':
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;