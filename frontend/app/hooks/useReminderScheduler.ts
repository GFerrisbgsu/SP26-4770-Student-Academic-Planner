import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '~/context/NotificationContext';
import {
  checkPendingReminders,
  getPendingReminders,
  getRemindersStats,
} from '~/services/reminderScheduler';
import { sendReminderNotification, canSendNotifications } from '~/services/notificationService';

const CHECK_INTERVAL_MS = 30000; // Check every 30 seconds

/**
 * Hook to manage background reminder checking and notification sending
 * Should be placed high in the component tree (preferably in root.tsx)
 * 
 * This hook:
 * - Periodically checks for pending reminders
 * - Sends notifications when reminders are due
 * - Handles edge cases like closed browser windows
 */
export function useReminderScheduler() {
  const { hasPermission, isEnabled } = useNotifications();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);

  const checkAndSendReminders = useCallback(async () => {
    // Skip if no permission, not enabled, or if we just checked recently
    if (!hasPermission || !isEnabled || !canSendNotifications()) {
      return;
    }

    const now = Date.now();
    // Don't check more than once per second
    if (now - lastCheckRef.current < 1000) {
      return;
    }

    lastCheckRef.current = now;

    try {
      const reminders = checkPendingReminders();

      // Send notifications for each pending reminder
      for (const reminder of reminders) {
        try {
          await sendReminderNotification(reminder.eventTitle, reminder.minutesBefore, isEnabled);
        } catch (error) {
          console.error(`Failed to send reminder for ${reminder.eventTitle}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking pending reminders:', error);
    }
  }, [hasPermission, isEnabled]);

  // Start the reminder checker on mount
  useEffect(() => {
    if (!hasPermission || !isEnabled || !canSendNotifications()) {
      return;
    }

    // Check immediately on mount
    checkAndSendReminders();

    // Set up periodic check
    intervalRef.current = setInterval(checkAndSendReminders, CHECK_INTERVAL_MS);

    // Also check when page becomes visible (after user returns from another tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndSendReminders();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasPermission, isEnabled, checkAndSendReminders]);

  return {
    checkAndSendReminders,
    getPendingReminders,
    getStats: getRemindersStats,
  };
}

/**
 * Simple version of the hook for non-critical code paths
 * Just returns the reminder data, doesn't set up background checking
 */
export function useRemindersData() {
  const pending = getPendingReminders();
  const stats = getRemindersStats();

  return { pending, stats };
}
