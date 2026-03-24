import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import { RegistrationForm } from '~/components/RegistrationForm';
import { useAuth } from '~/context/AuthContext';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Sign Up - Smart Academic Calendar' },
    { name: 'description', content: 'Create your academic planner account' },
  ];
}

export default function SignupPage() {
  const navigate = useNavigate();
  const hasRedirected = useRef(false);
  const { authLoading, isAuthenticated } = useAuth();

  // Redirect authenticated users to home page
  useEffect(() => {
    if (authLoading || !isAuthenticated || hasRedirected.current) {
      return;
    }

    hasRedirected.current = true;
    navigate('/', { replace: true });
  }, [authLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="mt-2 text-slate-600">
            Join us today and start organizing your academic journey
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <RegistrationForm />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>© 2026 Smart Academic Calendar. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}