/**
 * Storage layer type definitions for persistence system
 * 
 * Defines interfaces for queued operations, sync status, and storage operations
 * used throughout the auto-save and offline support infrastructure.
 */

/**
 * Represents a queued operation waiting to sync with backend
 * 
 * @example
 * ```ts
 * const request: QueuedRequest = {
 *   id: 'req-123',
 *   endpoint: '/api/events',
 *   method: 'POST',
 *   payload: { title: 'New Event' },
 *   timestamp: Date.now(),
 *   retries: 0,
 *   priority: 'high'
 * };
 * ```
 */
export interface QueuedRequest {
  /** Unique identifier for the queued request */
  id: string;
  
  /** API endpoint (relative path, e.g., '/api/events/123') */
  endpoint: string;
  
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /** Request body/payload (JSON serializable) */
  payload?: unknown;
  
  /** Unix timestamp when request was created */
  timestamp: number;
  
  /** Number of retry attempts (max 3) */
  retries: number;
  
  /** Priority level (POST > PATCH > DELETE > GET) */
  priority: 'high' | 'medium' | 'low';
  
  /** Last error message if retry failed */
  error?: string;
  
  /** Optional metadata for tracking/debugging */
  metadata?: {
    feature?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

/**
 * Current synchronization status
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

/**
 * Storage operation result
 */
export interface StorageOperation<T = unknown> {
  /** Whether operation succeeded */
  success: boolean;
  
  /** Retrieved or stored data */
  data?: T;
  
  /** Error message if operation failed */
  error?: string;
}

/**
 * Conflict resolution strategy for sync conflicts
 */
export type ConflictResolution = 'client-wins' | 'server-wins' | 'merge' | 'manual';

/**
 * Queue statistics for monitoring
 */
export interface QueueStats {
  /** Total requests in queue */
  total: number;
  
  /** Requests waiting to be processed */
  pending: number;
  
  /** Number of failed requests */
  failed: number;
  
  /** Timestamp of last processed request */
  lastProcessed: number | null;
  
  /** Breakdown by priority */
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Storage quota information
 */
export interface StorageQuota {
  /** Total available storage (bytes) */
  quota: number;
  
  /** Storage currently used (bytes) */
  usage: number;
  
  /** Percentage of quota used (0-100) */
  usagePercent: number;
  
  /** Whether quota is nearly full (>90%) */
  isNearLimit: boolean;
}

/**
 * IndexedDB configuration
 */
export interface IndexedDBConfig {
  /** Database name */
  name: string;
  
  /** Database version */
  version: number;
  
  /** Object store definitions */
  stores: {
    name: string;
    keyPath: string;
    indexes?: Array<{
      name: string;
      keyPath: string;
      options?: IDBIndexParameters;
    }>;
  }[];
}
