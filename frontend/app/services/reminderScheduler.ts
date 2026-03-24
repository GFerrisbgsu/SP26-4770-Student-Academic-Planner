import type { Event } from '~/types/event';
import type { ScheduledReminder } from '~/types/reminder';
import { notifyServiceWorkerRemindersUpdated } from '~/hooks/useServiceWorkerRegistration';

/**
 * Notification Scheduler Service
 * Manages background scheduling of event reminders
 * 
 * Features:
 * - Schedule reminders for events
 * - Store reminders in localStorage and IndexedDB for persistence
 * - Check pending reminders periodically
 * - Send notifications at the right time
 * - Sync with service worker for background notifications
 */

const STORAGE_KEY = 'scheduledReminders';
const DB_NAME = 'StudentPlannerDB';
const STORE_NAME = 'reminders';
const CHECK_INTERVAL_MS = 30000; // Check every 30 seconds

/**
 * Initialize IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Load reminders from IndexedDB or localStorage
 */
export async function loadRemindersAsync(): Promise<ScheduledReminder[]> {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    // Try IndexedDB first (more reliable for service worker)
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result;
        if (results.length > 0) {
          const reminders = results[0].data || [];
          resolve(
            reminders.map((r: any) => ({
              ...r,
              remindAt: new Date(r.remindAt),
              createdAt: new Date(r.createdAt),
            }))
          );
        } else {
          // Fall back to localStorage if no IndexedDB data
          resolve(loadReminders());
        }
      };
    });
  } catch (error) {
    console.error('Error loading from IndexedDB, falling back to localStorage:', error);
    return loadReminders();
  }
}

/**
 * Load reminders from localStorage (synchronous fallback)
 */
export function loadReminders(): ScheduledReminder[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);
    // Convert date strings back to Date objects
    return data.reminders.map((r: any) => ({
      ...r,
      remindAt: new Date(r.remindAt),
      createdAt: new Date(r.createdAt),
    }));
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
}

/**
 * Save reminders to both localStorage and IndexedDB
 */
export async function saveRemindersAsync(reminders: ScheduledReminder[]): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  // Save to localStorage first (faster)
  saveReminders(reminders);

  // Also save to IndexedDB for service worker access
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: 'current', data: reminders });

    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('[Reminder] Saved to IndexedDB');
        // Notify service worker about the update
        notifyServiceWorkerRemindersUpdated(reminders);
        resolve();
      };
    });
  } catch (error) {
    console.error('Error saving to IndexedDB:', error);
  }
}

/**
 * Save reminders to localStorage only (synchronous)
 */
export function saveReminders(reminders: ScheduledReminder[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        reminders,
        lastChecked: Date.now(),
      })
    );
  } catch (error) {
    console.error('Error saving reminders:', error);
  }
}

/**
 * Calculate when a reminder should fire
 * @param eventDate - Event date as string (YYYY-MM-DD)
 * @param eventTime - Event time as string (HH:MM), defaults to 00:00
 * @param minutesBefore - Minutes before event to remind
 * @returns Date object for when reminder should fire
 */
export function calculateReminderTime(
  eventDate: string,
  eventTime: string = '00:00',
  minutesBefore: number = 15
): Date {
  const [year, month, day] = eventDate.split('-').map(Number);
  const [hours, minutes] = eventTime.split(':').map(Number);
  
  // Create date in browser's local timezone (not UTC)
  // Date constructor: new Date(year, monthIndex, day, hours, minutes, seconds)
  const eventDateTime = new Date(year, month - 1, day, hours, minutes, 0);

  const reminderTime = new Date(eventDateTime.getTime() - minutesBefore * 60000);
  return reminderTime;
}

/**
 * Schedule a reminder for an event
 * @param event - The event to create a reminder for
 * @param minutesBefore - Minutes before event to send reminder
 * @returns The created reminder
 */
export async function scheduleReminderAsync(event: Event, minutesBefore: number = 15): Promise<ScheduledReminder> {
  const remindAt = calculateReminderTime(event.date, event.time || event.startTime || '00:00', minutesBefore);

  const reminder: ScheduledReminder = {
    id: `${event.id}-${minutesBefore}`,
    eventId: event.id,
    eventTitle: event.title,
    remindAt,
    minutesBefore,
    isSet: false,
    createdAt: new Date(),
  };

  console.log(`[Reminder] Reminder scheduled successfully: ${reminder.id}`);

  // Add to existing reminders
  const reminders = loadReminders();
  const existingIndex = reminders.findIndex((r) => r.id === reminder.id);

  if (existingIndex !== -1) {
    reminders[existingIndex] = reminder;
  } else {
    reminders.push(reminder);
  }

  await saveRemindersAsync(reminders);
  return reminder;
}

/**
 * Schedule a reminder for an event (synchronous version)
 * @param event - The event to create a reminder for
 * @param minutesBefore - Minutes before event to send reminder
 * @returns The created reminder
 */
export function scheduleReminder(event: Event, minutesBefore: number = 15): ScheduledReminder {
  const remindAt = calculateReminderTime(event.date, event.time || event.startTime || '00:00', minutesBefore);

  const reminder: ScheduledReminder = {
    id: `${event.id}-${minutesBefore}`,
    eventId: event.id,
    eventTitle: event.title,
    remindAt,
    minutesBefore,
    isSet: false,
    createdAt: new Date(),
  };

  console.log(`[Reminder] Reminder scheduled successfully: ${reminder.id}`);

  // Add to existing reminders
  const reminders = loadReminders();
  const existingIndex = reminders.findIndex((r) => r.id === reminder.id);

  if (existingIndex !== -1) {
    reminders[existingIndex] = reminder;
  } else {
    reminders.push(reminder);
  }

  saveReminders(reminders);
  // Async save to IndexedDB (fire and forget)
  saveRemindersAsync(reminders).catch(err => console.error('Async save failed:', err));
  return reminder;
}

/**
 * Remove a scheduled reminder
 * @param reminderId - The reminder ID to remove
 */
export async function removeReminderAsync(reminderId: string): Promise<void> {
  let reminders = loadReminders();
  reminders = reminders.filter((r) => r.id !== reminderId);
  await saveRemindersAsync(reminders);
}

/**
 * Remove a scheduled reminder (synchronous version)
 * @param reminderId - The reminder ID to remove
 */
export function removeReminder(reminderId: string): void {
  let reminders = loadReminders();
  reminders = reminders.filter((r) => r.id !== reminderId);
  saveReminders(reminders);
  saveRemindersAsync(reminders).catch(err => console.error('Async save failed:', err));
}

/**
 * Remove all reminders for a specific event
 * @param eventId - The event ID
 */
export async function removeEventRemindersAsync(eventId: number): Promise<void> {
  let reminders = loadReminders();
  reminders = reminders.filter((r) => r.eventId !== eventId);
  await saveRemindersAsync(reminders);
}

/**
 * Remove all reminders for a specific event (synchronous version)
 * @param eventId - The event ID
 */
export function removeEventReminders(eventId: number): void {
  let reminders = loadReminders();
  reminders = reminders.filter((r) => r.eventId !== eventId);
  saveReminders(reminders);
  saveRemindersAsync(reminders).catch(err => console.error('Async save failed:', err));
}

/**
 * Check and fire pending reminders
 * Returns list of reminders that were sent
 */
export function checkPendingReminders(): ScheduledReminder[] {
  const reminders = loadReminders();
  const now = new Date();
  const sentReminders: ScheduledReminder[] = [];

  reminders.forEach((reminder) => {
    // Check if it's time to send and hasn't been sent yet
    if (!reminder.isSet && reminder.remindAt.getTime() <= now.getTime()) {
      // Update reminder as sent
      reminder.isSet = true;
      sentReminders.push(reminder);
    }
  });

  if (sentReminders.length > 0) {
    saveReminders(reminders);
  }

  return sentReminders;
}

/**
 * Get all pending (unsent) reminders
 */
export function getPendingReminders(): ScheduledReminder[] {
  const reminders = loadReminders();
  return reminders.filter((r) => !r.isSet);
}

/**
 * Check if there are any reminders scheduled for a specific event
 */
export function hasReminder(eventId: number, minutesBefore?: number): boolean {
  const reminders = loadReminders();
  return reminders.some((r) => {
    if (minutesBefore !== undefined) {
      return r.eventId === eventId && r.minutesBefore === minutesBefore;
    }
    return r.eventId === eventId;
  });
}

/**
 * Get all reminders for a specific event
 */
export function getEventReminders(eventId: number): ScheduledReminder[] {
  const reminders = loadReminders();
  return reminders.filter((r) => r.eventId === eventId);
}

/**
 * Clear all reminders
 */
export async function clearAllRemindersAsync(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  await saveRemindersAsync([]);
}

/**
 * Clear all reminders (synchronous version)
 */
export function clearAllReminders(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  clearAllRemindersAsync().catch(err => console.error('Async clear failed:', err));
}

/**
 * Get summary stats about reminders
 */
export function getRemindersStats() {
  const reminders = loadReminders();
  const pending = reminders.filter((r) => !r.isSet);
  const sent = reminders.filter((r) => r.isSet);

  return {
    total: reminders.length,
    pending: pending.length,
    sent: sent.length,
    nextReminder: pending.length > 0
      ? pending.sort((a, b) => a.remindAt.getTime() - b.remindAt.getTime())[0]
      : null,
  };
}
