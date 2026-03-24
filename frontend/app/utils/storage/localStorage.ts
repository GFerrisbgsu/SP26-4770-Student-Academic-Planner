/**
 * Type-safe localStorage wrapper with error handling
 * 
 * Provides utilities for storing/retrieving typed data from localStorage,
 * managing request queues, and handling storage quota errors gracefully.
 * 
 * @example
 * ```ts
 * import { setItem, getItem, addToQueue } from '~/utils/storage/localStorage';
 * 
 * // Store typed data
 * setItem('user', { id: 1, name: 'John' });
 * 
 * // Retrieve with type safety
 * const user = getItem<User>('user');
 * 
 * // Queue operations for sync
 * addToQueue({
 *   id: 'req-1',
 *   endpoint: '/api/events',
 *   method: 'POST',
 *   payload: { title: 'New Event' },
 *   timestamp: Date.now(),
 *   retries: 0,
 *   priority: 'high'
 * });
 * ```
 */

import type { QueuedRequest, StorageOperation, QueueStats } from '~/types/storage';

/** Storage key for request queue */
const QUEUE_KEY = 'persistence_queue';

/** Storage key prefix for application data */
const APP_PREFIX = 'sap_';

/**
 * Set an item in localStorage with type safety and error handling
 * 
 * @param key - Storage key (will be prefixed with APP_PREFIX)
 * @param value - Value to store (must be JSON serializable)
 * @returns Operation result with success status
 */
export function setItem<T>(key: string, value: T): StorageOperation<T> {
  try {
    const prefixedKey = `${APP_PREFIX}${key}`;
    const serialized = JSON.stringify(value);
    localStorage.setItem(prefixedKey, serialized);
    
    return { success: true, data: value };
  } catch (error) {
    if (error instanceof Error) {
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Consider clearing old data.');
        return {
          success: false,
          error: 'Storage quota exceeded. Please clear some data.'
        };
      }
      
      console.error('Failed to set localStorage item:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown storage error' };
  }
}

/**
 * Get an item from localStorage with type safety
 * 
 * @param key - Storage key (will be prefixed with APP_PREFIX)
 * @returns Operation result with retrieved data or null if not found
 */
export function getItem<T>(key: string): StorageOperation<T | null> {
  try {
    const prefixedKey = `${APP_PREFIX}${key}`;
    const item = localStorage.getItem(prefixedKey);
    
    if (item === null) {
      return { success: true, data: null };
    }
    
    const parsed = JSON.parse(item) as T;
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to get localStorage item:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown retrieval error' };
  }
}

/**
 * Remove an item from localStorage
 * 
 * @param key - Storage key (will be prefixed with APP_PREFIX)
 * @returns Operation result
 */
export function removeItem(key: string): StorageOperation<void> {
  try {
    const prefixedKey = `${APP_PREFIX}${key}`;
    localStorage.removeItem(prefixedKey);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to remove localStorage item:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown removal error' };
  }
}

/**
 * Get the current request queue
 * 
 * @returns Array of queued requests (empty if none)
 */
export function getQueue(): QueuedRequest[] {
  const result = getItem<QueuedRequest[]>(QUEUE_KEY);
  return result.success && result.data ? result.data : [];
}

/**
 * Add a request to the queue
 * 
 * @param request - Request to queue
 * @returns Operation result
 */
export function addToQueue(request: QueuedRequest): StorageOperation<QueuedRequest[]> {
  try {
    const queue = getQueue();
    
    // Check for duplicate (same endpoint + method + similar timestamp)
    const isDuplicate = queue.some(
      (req) =>
        req.endpoint === request.endpoint &&
        req.method === request.method &&
        Math.abs(req.timestamp - request.timestamp) < 1000 // Within 1 second
    );
    
    if (isDuplicate) {
      console.warn('Duplicate request detected, skipping:', request.id);
      return { success: true, data: queue };
    }
    
    // Add new request
    const updatedQueue = [...queue, request];
    const result = setItem(QUEUE_KEY, updatedQueue);
    
    if (result.success) {
      console.log(`Added request ${request.id} to queue (${updatedQueue.length} total)`);
      return { success: true, data: updatedQueue };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to add to queue:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown queue error' };
  }
}

/**
 * Remove a request from the queue by ID
 * 
 * @param id - Request ID to remove
 * @returns Operation result with updated queue
 */
export function removeFromQueue(id: string): StorageOperation<QueuedRequest[]> {
  try {
    const queue = getQueue();
    const updatedQueue = queue.filter((req) => req.id !== id);
    
    const result = setItem(QUEUE_KEY, updatedQueue);
    
    if (result.success) {
      console.log(`Removed request ${id} from queue (${updatedQueue.length} remaining)`);
      return { success: true, data: updatedQueue };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to remove from queue:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown queue error' };
  }
}

/**
 * Update a request in the queue (e.g., increment retry count)
 * 
 * @param id - Request ID to update
 * @param updates - Partial updates to apply
 * @returns Operation result with updated queue
 */
export function updateQueueItem(
  id: string,
  updates: Partial<QueuedRequest>
): StorageOperation<QueuedRequest[]> {
  try {
    const queue = getQueue();
    const index = queue.findIndex((req) => req.id === id);
    
    if (index === -1) {
      return { success: false, error: `Request ${id} not found in queue` };
    }
    
    const updatedQueue = [...queue];
    updatedQueue[index] = { ...updatedQueue[index], ...updates };
    
    const result = setItem(QUEUE_KEY, updatedQueue);
    
    if (result.success) {
      return { success: true, data: updatedQueue };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown update error' };
  }
}

/**
 * Clear the entire queue (use with caution!)
 * 
 * @returns Operation result
 */
export function clearQueue(): StorageOperation<void> {
  try {
    const result = removeItem(QUEUE_KEY);
    
    if (result.success) {
      console.log('Queue cleared successfully');
    }
    
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to clear queue:', error.message);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: 'Unknown clear error' };
  }
}

/**
 * Get queue statistics
 * 
 * @returns Queue stats including counts by priority and status
 */
export function getQueueStats(): QueueStats {
  const queue = getQueue();
  
  const stats: QueueStats = {
    total: queue.length,
    pending: 0,
    failed: 0,
    lastProcessed: null,
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  queue.forEach((req) => {
    // Count by priority
    stats.byPriority[req.priority]++;
    
    // Count failed (retries >= 3)
    if (req.retries >= 3) {
      stats.failed++;
    } else {
      stats.pending++;
    }
  });
  
  // Get last processed timestamp from metadata (if available)
  const lastProcessedResult = getItem<number>('last_queue_processed');
  if (lastProcessedResult.success && lastProcessedResult.data) {
    stats.lastProcessed = lastProcessedResult.data;
  }
  
  return stats;
}

/**
 * Update last processed timestamp
 * 
 * @param timestamp - Unix timestamp of last queue processing
 */
export function setLastProcessed(timestamp: number): void {
  setItem('last_queue_processed', timestamp);
}

/**
 * Get estimated storage usage (if Storage Manager API available)
 * 
 * @returns Storage quota information or null if unavailable
 */
export async function getStorageQuota(): Promise<{
  quota: number;
  usage: number;
  usagePercent: number;
  isNearLimit: boolean;
} | null> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const quota = estimate.quota || 0;
      const usage = estimate.usage || 0;
      const usagePercent = quota > 0 ? (usage / quota) * 100 : 0;
      
      return {
        quota,
        usage,
        usagePercent,
        isNearLimit: usagePercent > 90
      };
    }
  } catch (error) {
    console.warn('Storage quota estimation not available:', error);
  }
  
  return null;
}

/**
 * Check if localStorage is available and functional
 * 
 * @returns True if localStorage can be used
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all application data from localStorage (except queue)
 * Use for logout or data reset
 * 
 * @param preserveQueue - Whether to preserve the sync queue (default: true)
 */
export function clearAllData(preserveQueue = true): void {
  try {
    const queue = preserveQueue ? getQueue() : [];
    
    // Remove all app-prefixed items
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(APP_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    
    // Restore queue if needed
    if (preserveQueue && queue.length > 0) {
      setItem(QUEUE_KEY, queue);
    }
    
    console.log('Application data cleared');
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}
