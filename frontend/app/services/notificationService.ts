/**
 * Notification Service
 * Utility functions for sending browser notifications
 * Use with useNotifications() hook to check permission first
 */

export interface NotificationConfig {
  title: string;
  options?: NotificationOptions;
}

/**
 * Send a browser notification
 * @param config - Notification config with title and options
 * @param isEnabled - Whether notifications are enabled by user (default: true for backward compatibility)
 * @returns Promise resolving to the notification, or null if permission not granted or disabled
 */
export async function sendNotification(config: NotificationConfig, isEnabled: boolean = true): Promise<Notification | null> {
  if (!isEnabled) {
    console.warn('Notifications are disabled');
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(config.title, config.options);
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

/**
 * Send a notification with auto-close
 * @param config - Notification config
 * @param closeAfterMs - Milliseconds before auto-closing (default: 5000)
 * @param isEnabled - Whether notifications are enabled by user (default: true)
 */
export async function sendNotificationAutoClose(
  config: NotificationConfig,
  closeAfterMs: number = 5000,
  isEnabled: boolean = true
): Promise<Notification | null> {
  const notification = await sendNotification(config, isEnabled);

  if (notification) {
    setTimeout(() => {
      notification.close();
    }, closeAfterMs);
  }

  return notification;
}

/**
 * Send a reminder notification for an event
 * @param eventTitle - The event title
 * @param minutesBefore - How many minutes before the event
 * @param isEnabled - Whether notifications are enabled by user (default: true)
 */
export async function sendReminderNotification(
  eventTitle: string,
  minutesBefore: number,
  isEnabled: boolean = true
): Promise<Notification | null> {
  return sendNotification({
    title: `Reminder: ${eventTitle}`,
    options: {
      body: `Your event starts in ${minutesBefore} minutes`,
      icon: '/calendar-icon.png', // TODO: Add proper icon
      badge: '/calendar-badge.png', // TODO: Add proper badge
      tag: `reminder-${eventTitle}`, // Prevent duplicates
      requireInteraction: minutesBefore <= 15, // Keep visible for imminent reminders
    },
  }, isEnabled);
}

/**
 * Check if notifications are supported and permitted
 */
export function canSendNotifications(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}
