/**
 * Service Worker for Background Reminder Notifications
 * Manages background scheduling, notification events, and communication with main app
 */

const STORAGE_KEY = 'scheduledReminders';
const CHECK_INTERVAL_MS = 30000; // Check every 30 seconds
const CACHE_NAME = 'student-planner-v1';

// Keep track of the reminder checking interval
let reminderCheckInterval = null;

/**
 * Initialize the service worker and start reminder checking
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
  
  // Start reminder checking when service worker activates
  startReminderChecking();
});

/**
 * Start periodic reminder checking
 */
function startReminderChecking() {
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
  }

  console.log('[Service Worker] Starting reminder checks every', CHECK_INTERVAL_MS, 'ms');
  
  // Check immediately
  checkAndNotifyReminders();
  
  // Check periodically
  reminderCheckInterval = setInterval(checkAndNotifyReminders, CHECK_INTERVAL_MS);
}

/**
 * Check for pending reminders and send notifications
 */
async function checkAndNotifyReminders() {
  try {
    const reminders = await loadReminders();
    const now = new Date();
    const pendingReminders = [];

    reminders.forEach((reminder) => {
      // Check if it's time to send and hasn't been sent yet
      if (!reminder.isSet && new Date(reminder.remindAt).getTime() <= now.getTime()) {
        reminder.isSet = true;
        pendingReminders.push(reminder);
      }
    });

    // Save updated reminders
    if (pendingReminders.length > 0) {
      await saveReminders(reminders);
      
      // Send notification for each pending reminder
      for (const reminder of pendingReminders) {
        await sendNotification(reminder);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error checking reminders:', error);
  }
}

/**
 * Send a browser notification
 */
async function sendNotification(reminder) {
  try {
    const options = {
      body: `Your event starts in ${reminder.minutesBefore} minutes`,
      icon: '/calendar-icon.png',
      badge: '/calendar-badge.png',
      tag: `reminder-${reminder.eventId}`,
      requireInteraction: reminder.minutesBefore <= 15,
      data: {
        eventId: reminder.eventId,
        eventTitle: reminder.eventTitle,
        reminderId: reminder.id,
      },
    };

    console.log('[Service Worker] Sending notification:', reminder.eventTitle);
    await self.registration.showNotification(`Reminder: ${reminder.eventTitle}`, options);
  } catch (error) {
    console.error('[Service Worker] Error sending notification:', error);
  }
}

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification.data);
  event.notification.close();

  // Focus the app window if it exists
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Try to focus existing window
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/**
 * Handle notification close
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.data);
});

/**
 * Handle messages from the main app
 */
self.addEventListener('message', (event) => {
  const { type, reminders, enabled } = event.data;

  switch (type) {
    case 'REMINDERS_UPDATED':
      console.log('[Service Worker] Received reminders update from app');
      saveReminders(reminders);
      // Force a check after update
      checkAndNotifyReminders();
      break;

    case 'START_REMINDER_CHECK':
      console.log('[Service Worker] Received start reminder check');
      startReminderChecking();
      break;

    case 'STOP_REMINDER_CHECK':
      console.log('[Service Worker] Received stop reminder check');
      if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
        reminderCheckInterval = null;
      }
      break;

    case 'NOTIFICATIONS_ENABLED_CHANGED':
      console.log('[Service Worker] Notifications enabled state changed:', enabled);
      if (enabled) {
        startReminderChecking();
      } else {
        if (reminderCheckInterval) {
          clearInterval(reminderCheckInterval);
          reminderCheckInterval = null;
        }
        console.log('[Service Worker] Reminder checking stopped - notifications disabled');
      }
      break;

    default:
      console.log('[Service Worker] Unknown message type:', type);
  }
});

/**
 * Load reminders from IndexedDB (more persistent than localStorage)
 */
async function loadReminders() {
  try {
    // Try IndexedDB first (more reliable for service workers)
    const db = await openDatabase();
    const reminders = await getFromDB(db, 'reminders');
    if (reminders) {
      return reminders.map((r) => ({
        ...r,
        remindAt: new Date(r.remindAt),
        createdAt: new Date(r.createdAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('[Service Worker] Error loading reminders from IndexedDB:', error);
    return [];
  }
}

/**
 * Save reminders to IndexedDB
 */
async function saveReminders(reminders) {
  try {
    const db = await openDatabase();
    await putInDB(db, 'reminders', reminders);
  } catch (error) {
    console.error('[Service Worker] Error saving reminders to IndexedDB:', error);
  }
}

/**
 * Open IndexedDB database
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StudentPlannerDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('reminders')) {
        db.createObjectStore('reminders', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Get item from IndexedDB
 */
function getFromDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Put item into IndexedDB
 */
function putInDB(db, storeName, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put({ id: 'current', data });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Periodic background sync (for potential future use)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-reminders') {
    console.log('[Service Worker] Background sync: checking reminders');
    event.waitUntil(checkAndNotifyReminders());
  }
});

console.log('[Service Worker] Script loaded and ready');
