import { useEffect } from 'react';

/**
 * Hook to register and manage the service worker
 * Handles registration, updates, and communication with the service worker
 */
export function useServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production or if explicitly enabled
    const shouldRegister = import.meta.env.PROD || localStorage.getItem('SW_ENABLED') === 'true';

    if (!shouldRegister || !('serviceWorker' in navigator)) {
      console.log('[useServiceWorkerRegistration] Service Worker not available or disabled');
      return;
    }

    registerServiceWorker();
  }, []);
}

/**
 * Register the service worker
 */
async function registerServiceWorker() {
  try {
    console.log('[Service Worker] Registering...');

    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[Service Worker] Registration successful:', registration);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('[Service Worker] Updated to new version');
        }
      });
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 3600000); // Check every hour

    return registration;
  } catch (error) {
    console.error('[Service Worker] Registration failed:', error);
  }
}

/**
 * Send a message to the service worker
 */
export function sendMessageToServiceWorker(message: any) {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.warn('[Service Worker] Service worker not available');
    return;
  }

  try {
    navigator.serviceWorker.controller.postMessage(message);
    console.log('[Service Worker] Message sent:', message.type);
  } catch (error) {
    console.error('[Service Worker] Error sending message:', error);
  }
}

/**
 * Notify service worker about reminder updates
 */
export function notifyServiceWorkerRemindersUpdated(reminders: any[]) {
  sendMessageToServiceWorker({
    type: 'REMINDERS_UPDATED',
    reminders,
  });
}

/**
 * Notify service worker about notification enabled state change
 */
export function notifyServiceWorkerEnabledStateChanged(enabled: boolean) {
  sendMessageToServiceWorker({
    type: 'NOTIFICATIONS_ENABLED_CHANGED',
    enabled,
  });
}

/**
 * Request service worker to start/stop reminder checking
 */
export function requestServiceWorkerCheck(action: 'start' | 'stop') {
  sendMessageToServiceWorker({
    type: action === 'start' ? 'START_REMINDER_CHECK' : 'STOP_REMINDER_CHECK',
  });
}
