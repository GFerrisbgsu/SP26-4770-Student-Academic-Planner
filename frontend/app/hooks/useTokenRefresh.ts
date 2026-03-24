import { useCallback, useEffect, useRef } from 'react';

import { userService } from '~/services/userService';

/**
 * Hook to automatically refresh access tokens before expiration.
 * Access tokens expire after 15 minutes - this refreshes at 13 minutes (2 min buffer).
 */
export function useTokenRefresh(isAuthenticated: boolean, onSessionExpired: () => void) {
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  // Access token expires after 15 minutes (900 seconds)
  const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
  const REFRESH_BUFFER_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry
  const REFRESH_INTERVAL_MS = ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS; // 13 minutes
  const WARNING_TIME_MS = ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS; // Show warning at 13 minutes

  const refreshToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshingRef.current) {
      console.log('[TokenRefresh] Refresh already in progress, skipping');
      return false;
    }

    isRefreshingRef.current = true;

    try {
      console.log('[TokenRefresh] Starting token refresh...');
      const success = await userService.refreshToken();
      
      if (!success) {
        // Refresh failed - session expired
        console.warn('[TokenRefresh] Token refresh failed - logging out');
        onSessionExpired();
        return false;
      }
      
      // Refresh successful
      console.log('[TokenRefresh] Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[TokenRefresh] Error refreshing token:', error);
      onSessionExpired();
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onSessionExpired]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear any existing timers when not authenticated
      if (refreshIntervalRef.current) {
        console.log('[TokenRefresh] User logged out - clearing refresh timer');
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    // Prevent setting up multiple intervals
    if (refreshIntervalRef.current) {
      console.log('[TokenRefresh] Refresh timer already exists, skipping setup');
      return;
    }

    // Set up automatic token refresh
    const intervalMinutes = REFRESH_INTERVAL_MS / 60000;
    console.log(`[TokenRefresh] Setting up refresh timer - will refresh every ${intervalMinutes} minute(s)`);

    // Schedule automatic refresh at regular intervals
    // First refresh will happen after REFRESH_INTERVAL_MS (1 minute for 3-min tokens)
    refreshIntervalRef.current = setInterval(() => {
      console.log(`[TokenRefresh] Interval triggered - auto-refreshing token`);
      refreshToken();
    }, REFRESH_INTERVAL_MS);

    // Cleanup on unmount or when authentication changes
    return () => {
      if (refreshIntervalRef.current) {
        console.log('[TokenRefresh] Cleaning up refresh timer');
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, refreshToken, REFRESH_INTERVAL_MS]);
}
