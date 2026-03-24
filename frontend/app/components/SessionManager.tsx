import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '~/context/AuthContext';
import { useTokenRefresh } from '~/hooks/useTokenRefresh';
import { useActivityTracker } from '~/hooks/useActivityTracker';

/**
 * SessionManager component handles:
 * - Automatic token refresh before expiration
 * - Inactivity timeout tracking
 * 
 * This component should be placed inside AuthProvider in the app tree.
 */
export function SessionManager() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Handle session expiry - logout and redirect to login
  const handleSessionExpired = useCallback(async () => {
    console.log('[SessionManager] Session expired - logging out');
    await logout();
    navigate('/login?expired=true');
  }, [logout, navigate]);

  // Token refresh hook - automatically refreshes tokens before expiry
  useTokenRefresh(isAuthenticated, handleSessionExpired);

  // Activity tracking hook - 30 minute inactivity timeout
  useActivityTracker(isAuthenticated, handleSessionExpired);

  return null;
}
