import { useMemo, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from '~/context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  const redirectState = useMemo(
    () => ({ from: `${location.pathname}${location.search}` }),
    [location.pathname, location.search]
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={redirectState} />;
  }

  return <>{children}</>;
}
