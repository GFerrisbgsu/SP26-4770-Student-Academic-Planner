import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notifyServiceWorkerEnabledStateChanged } from '~/hooks/useServiceWorkerRegistration';

export type NotificationPermission = 'granted' | 'denied' | 'default';

interface NotificationContextValue {
  permission: NotificationPermission;
  isSupported: boolean;
  permitNotifications: () => Promise<NotificationPermission>;
  hasPermission: boolean;
  isEnabled: boolean;
  toggleNotificationsEnabled: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Check if the browser supports the Notifications API
 */
const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Load permission from localStorage or current browser permission
 */
const loadPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'default';
  }

  // First, check what the browser thinks
  const browserPermission = Notification.permission as NotificationPermission;
  return browserPermission;
};

/**
 * Load enabled state from localStorage
 */
const loadEnabledState = (): boolean => {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const stored = localStorage.getItem('notificationsEnabled');
    return stored === null || stored === 'true'; // Default to true if not set
  } catch (error) {
    console.error('Error loading notifications enabled state:', error);
    return true;
  }
};

/**
 * Save enabled state to localStorage
 */
const saveEnabledState = (enabled: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('notificationsEnabled', String(enabled));
  } catch (error) {
    console.error('Error saving notifications enabled state:', error);
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSupported] = useState(() => isNotificationSupported());

  // Load permission and enabled state on mount
  useEffect(() => {
    if (isSupported) {
      setPermission(loadPermission());
    }
    setIsEnabled(loadEnabledState());
  }, [isSupported]);

  const permitNotifications = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported in this browser');
      return 'default';
    }

    // If already granted or denied, return current state
    if (Notification.permission !== 'default') {
      setPermission(Notification.permission as NotificationPermission);
      return Notification.permission as NotificationPermission;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);

      // Store preference in localStorage for future reference
      localStorage.setItem('notificationPermission', result);

      return result as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const toggleNotificationsEnabled = useCallback((): void => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    saveEnabledState(newState);
    notifyServiceWorkerEnabledStateChanged(newState);
    console.log('[Notifications] Toggled to:', newState ? 'enabled' : 'disabled');
  }, [isEnabled]);

  const value: NotificationContextValue = {
    permission,
    isSupported,
    permitNotifications,
    hasPermission: permission === 'granted',
    isEnabled,
    toggleNotificationsEnabled,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

/**
 * Hook to access notification context
 * Must be used within NotificationProvider
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
