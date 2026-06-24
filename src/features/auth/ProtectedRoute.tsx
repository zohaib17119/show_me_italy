import type { ReactNode } from 'react';

// TODO: enable after login/signup screens are built
// import { Navigate } from 'react-router-dom';
// import { useAppSelector } from '@/app/hooks';
// import { ROUTES } from '@/constants/routes';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  // if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  return children;
}
