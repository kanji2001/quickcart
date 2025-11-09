import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, selectAuthUser, selectIsAuthenticated } from '@/stores/auth-store';

interface RequireAdminProps {
  children: ReactNode;
}

export const RequireAdmin = ({ children }: RequireAdminProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectAuthUser);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
