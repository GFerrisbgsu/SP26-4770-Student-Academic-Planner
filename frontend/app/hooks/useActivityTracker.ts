import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook to track user activity and trigger callback after inactivity timeout.
 * Tracks mouse, keyboard, scroll, click, and touch events.
 * Timeout is 30 minutes (1800 seconds) of no activity.
 * 
 * @param isAuthenticated - Whether user is currently authenticated
 * @param onInactivityTimeout - Callback to execute when timeout reached
 */
export function useActivityTracker(
  isAuthenticated: boolean,
  onInactivityTimeout: () => void
) {
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activityThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
  const ACTIVITY_THROTTLE_MS = 5 * 1000; // Update last activity at most every 5 seconds

  // Update last activity timestamp (throttled)
  const updateActivity = useCallback(() => {
    // Throttle activity updates to avoid excessive updates
    if (activityThrottleRef.current) {
      return; // Already have a pending update
    }

    activityThrottleRef.current = setTimeout(() => {
      lastActivityRef.current = Date.now();
      console.log('[ActivityTracker] Activity detected');
      activityThrottleRef.current = null;
    }, ACTIVITY_THROTTLE_MS);
  }, [ACTIVITY_THROTTLE_MS]);

  // Check if inactivity timeout has been reached
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT_MS) {
      console.warn('[ActivityTracker] Inactivity timeout reached - logging out');
      onInactivityTimeout();
    } else {
      const remainingMinutes = Math.floor((INACTIVITY_TIMEOUT_MS - timeSinceLastActivity) / 60000);
      console.log(`[ActivityTracker] ${remainingMinutes} minutes until inactivity timeout`);
    }
  }, [INACTIVITY_TIMEOUT_MS, onInactivityTimeout]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear activity tracking when not authenticated
      if (timeoutCheckIntervalRef.current) {
        clearInterval(timeoutCheckIntervalRef.current);
        timeoutCheckIntervalRef.current = null;
      }
      if (activityThrottleRef.current) {
        clearTimeout(activityThrottleRef.current);
        activityThrottleRef.current = null;
      }
      return;
    }

    console.log('[ActivityTracker] Starting activity tracking');

    // Reset activity timestamp
    lastActivityRef.current = Date.now();

    // Activity event types to track
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Start periodic inactivity check
    timeoutCheckIntervalRef.current = setInterval(checkInactivity, CHECK_INTERVAL_MS);

    // Cleanup on unmount or when authentication changes
    return () => {
      console.log('[ActivityTracker] Stopping activity tracking');

      // Remove event listeners
      activityEvents.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      // Clear timers
      if (timeoutCheckIntervalRef.current) {
        clearInterval(timeoutCheckIntervalRef.current);
      }
      if (activityThrottleRef.current) {
        clearTimeout(activityThrottleRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, checkInactivity, CHECK_INTERVAL_MS]);
}
