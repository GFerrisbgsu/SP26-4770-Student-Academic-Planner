import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { LoginForm } from '~/components/LoginForm';
import { useAuth } from '~/context/AuthContext';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Login - Smart Academic Calendar' },
    { name: 'description', content: 'Login to your academic planner account' },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  const redirectTo = useMemo(
    () => (typeof location.state?.from === 'string' ? location.state.from : '/'),
    [location.state?.from]
  );
  const { authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (authLoading || !isAuthenticated || hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;
    navigate(redirectTo, { replace: true });
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const handleLoginSuccess = useCallback(() => {
    navigate(redirectTo);
  }, [navigate, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-slate-600">
            Sign in to your account to continue planning your academic journey
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>© 2026 Smart Academic Calendar. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
