/**
 * Request queue management for offline operations
 * 
 * Manages queuing, processing, and retry logic for API requests
 * when offline or when requests fail.
 * 
 * @example
 * ```ts
 * import { enqueueRequest, processQueue } from '~/utils/network/requestQueue';
 * 
 * // Queue a request
 * await enqueueRequest({
 *   endpoint: '/api/events',
 *   method: 'POST',
 *   payload: { title: 'New Event' }
 * });
 * 
 * // Process queue when back online
 * const result = await processQueue(true);
 * console.log(`Processed ${result.processed} requests`);
 * ```
 */

import type { QueuedRequest, QueueStats } from '~/types/storage';
import type { SyncResult } from '~/types/sync';
import {
  getQueue,
  addToQueue as addToStorageQueue,
  removeFromQueue as removeFromStorageQueue,
  updateQueueItem,
  setLastProcessed,
  getQueueStats as getStorageQueueStats
} from '~/utils/storage/localStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Maximum retry attempts per request */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY = 1000;

/** Maximum retry delay (ms) */
const MAX_RETRY_DELAY = 10000;

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine priority based on HTTP method
 */
function getPriority(method: QueuedRequest['method']): QueuedRequest['priority'] {
  switch (method) {
    case 'POST':
      return 'high'; // Creates must happen first
    case 'PATCH':
    case 'PUT':
      return 'medium'; // Updates happen after creates
    case 'DELETE':
      return 'low'; // Deletes happen last
    default:
      return 'low';
  }
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(retries: number): number {
  const delay = BASE_RETRY_DELAY * Math.pow(2, retries);
  return Math.min(delay, MAX_RETRY_DELAY);
}

/**
 * Sort queue by priority (high > medium > low) and timestamp
 */
function sortQueue(queue: QueuedRequest[]): QueuedRequest[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return [...queue].sort((a, b) => {
    // First, sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by timestamp (oldest first)
    return a.timestamp - b.timestamp;
  });
}

/**
 * Enqueue a request for later processing
 * 
 * @param request - Request configuration (without id, timestamp, retries)
 * @returns Request ID
 */
export async function enqueueRequest(
  request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries' | 'priority'>
): Promise<string> {
  const queuedRequest: QueuedRequest = {
    ...request,
    id: generateRequestId(),
    timestamp: Date.now(),
    retries: 0,
    priority: getPriority(request.method)
  };
  
  const result = addToStorageQueue(queuedRequest);
  
  if (!result.success) {
    throw new Error(`Failed to enqueue request: ${result.error}`);
  }
  
  console.log(`Enqueued ${request.method} ${request.endpoint} [${queuedRequest.id}]`);
  
  return queuedRequest.id;
}

/**
 * Execute a single queued request
 * 
 * @param request - Queued request to execute
 * @returns True if successful, false if failed
 */
async function executeRequest(request: QueuedRequest): Promise<boolean> {
  try {
    const url = `${API_BASE_URL}${request.endpoint}`;
    
    // Build headers with auth token if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('authToken');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const options: RequestInit = {
      method: request.method,
      headers
    };
    
    if (request.payload && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
      options.body = JSON.stringify(request.payload);
    }
    
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log(`✓ Executed ${request.method} ${request.endpoint} [${request.id}]`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`✗ Failed ${request.method} ${request.endpoint} [${request.id}]:`, errorMessage);
    
    // Update request with error
    updateQueueItem(request.id, {
      error: errorMessage,
      retries: request.retries + 1
    });
    
    return false;
  }
}

/**
 * Retry a failed request with exponential backoff
 * 
 * @param request - Request to retry
 * @returns True if successful, false if max retries exceeded
 */
export async function retryRequest(request: QueuedRequest): Promise<boolean> {
  if (request.retries >= MAX_RETRIES) {
    console.error(`Max retries exceeded for ${request.id}`);
    return false;
  }
  
  // Wait with exponential backoff
  const delay = getRetryDelay(request.retries);
  await new Promise((resolve) => setTimeout(resolve, delay));
  
  console.log(`Retrying ${request.id} (attempt ${request.retries + 1}/${MAX_RETRIES})`);
  
  return executeRequest(request);
}

/**
 * Process all queued requests
 * 
 * @param isOnline - Whether network is currently online
 * @returns Sync result with statistics
 */
export async function processQueue(isOnline: boolean): Promise<SyncResult> {
  const startTime = Date.now();
  
  if (!isOnline) {
    return {
      success: false,
      processed: 0,
      failed: 0,
      duration: 0,
      timestamp: Date.now(),
      error: 'Cannot process queue - device is offline'
    };
  }
  
  const queue = getQueue();
  
  if (queue.length === 0) {
    return {
      success: true,
      processed: 0,
      failed: 0,
      duration: Date.now() - startTime,
      timestamp: Date.now()
    };
  }
  
  console.log(`Processing queue: ${queue.length} requests`);
  
  // Sort by priority
  const sortedQueue = sortQueue(queue);
  
  let processed = 0;
  let failed = 0;
  const failedRequests: QueuedRequest[] = [];
  
  // Process sequentially to maintain order
  for (const request of sortedQueue) {
    // Skip already failed requests (max retries exceeded)
    if (request.retries >= MAX_RETRIES) {
      failed++;
      failedRequests.push(request);
      continue;
    }
    
    const success = await executeRequest(request);
    
    if (success) {
      // Remove from queue
      removeFromStorageQueue(request.id);
      processed++;
    } else {
      // Will be retried next time
      failed++;
      failedRequests.push(request);
    }
  }
  
  // Update last processed timestamp
  setLastProcessed(Date.now());
  
  const duration = Date.now() - startTime;
  
  console.log(`Queue processing complete: ${processed} succeeded, ${failed} failed (${duration}ms)`);
  
  return {
    success: failed === 0,
    processed,
    failed,
    duration,
    timestamp: Date.now(),
    failedRequests: failedRequests.length > 0 ? failedRequests : undefined
  };
}

/**
 * Dequeue a specific request (mark as processed)
 * 
 * @param id - Request ID to remove
 */
export function dequeueRequest(id: string): void {
  const result = removeFromStorageQueue(id);
  
  if (result.success) {
    console.log(`Dequeued request ${id}`);
  } else {
    console.error(`Failed to dequeue ${id}:`, result.error);
  }
}

/**
 * Mark a request as permanently failed
 * 
 * @param id - Request ID
 * @param error - Error message
 */
export function markRequestFailed(id: string, error: string): void {
  updateQueueItem(id, {
    error,
    retries: MAX_RETRIES // Mark as max retries to prevent further attempts
  });
  
  console.error(`Request ${id} marked as failed:`, error);
}

/**
 * Get queue statistics
 * 
 * @returns Queue stats
 */
export function getQueueStats(): QueueStats {
  return getStorageQueueStats();
}

/**
 * Process a batch of requests in parallel (advanced)
 * 
 * @param requests - Array of requests to process
 * @param batchSize - Number of concurrent requests (default: 3)
 * @returns Number of successful requests
 */
export async function processBatch(
  requests: QueuedRequest[],
  batchSize: number = 3
): Promise<number> {
  let successful = 0;
  
  // Process in batches
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    
    const results = await Promise.all(
      batch.map((request) => executeRequest(request))
    );
    
    results.forEach((success, index) => {
      if (success) {
        removeFromStorageQueue(batch[index].id);
        successful++;
      }
    });
  }
  
  return successful;
}
