import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { ROUTES } from '@/constants/routes';
import { hasPermission } from './permissions';
import {
  firstAllowedPath,
  requiredPermissionForPath,
} from './routePermissions';
import {
  selectAuthPermissions,
  selectIsAuthenticated,
  selectPermissionsStatus,
} from './authSlice';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const permissions = useAppSelector(selectAuthPermissions);
  const permissionsStatus = useAppSelector(selectPermissionsStatus);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  // Wait for session claims on refresh before enforcing route gates.
  if (permissionsStatus === 'loading' || permissionsStatus === 'idle') {
    return children;
  }

  const required = requiredPermissionForPath(location.pathname);
  if (required && !hasPermission(permissions, required)) {
    const fallback = firstAllowedPath(permissions);
    if (fallback === ROUTES.LOGIN) {
      return <Navigate to={ROUTES.LOGIN} replace />;
    }
    if (fallback !== location.pathname) {
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
}
