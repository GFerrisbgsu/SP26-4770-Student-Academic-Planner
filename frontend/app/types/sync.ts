/**
 * Sync layer type definitions for data synchronization
 * 
 * Defines interfaces for sync operations, results, metadata, and network status
 * used by the sync engine and auto-save infrastructure.
 */

import type { SyncStatus, QueuedRequest } from './storage';

/**
 * Result of a sync operation
 * 
 * @example
 * ```ts
 * const result: SyncResult = {
 *   success: true,
 *   processed: 5,
 *   failed: 0,
 *   duration: 1234,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface SyncResult {
  /** Overall sync success status */
  success: boolean;
  
  /** Number of requests successfully processed */
  processed: number;
  
  /** Number of requests that failed */
  failed: number;
  
  /** Sync duration in milliseconds */
  duration: number;
  
  /** Unix timestamp when sync completed */
  timestamp: number;
  
  /** Failed requests for retry */
  failedRequests?: QueuedRequest[];
  
  /** Error message if sync completely failed */
  error?: string;
}

/**
 * Conflict data when local and remote data differ
 */
export interface SyncConflict<T = unknown> {
  /** Conflicted item identifier */
  id: string;
  
  /** Local version of data */
  local: T;
  
  /** Server version of data */
  remote: T;
  
  /** Local last modified timestamp */
  localTimestamp: number;
  
  /** Server last modified timestamp */
  remoteTimestamp: number;
  
  /** Resolution strategy to apply */
  resolution: import('./storage').ConflictResolution;
}

/**
 * Metadata for tracking sync state
 */
export interface SyncMetadata {
  /** Last successful sync timestamp */
  lastSync: number | null;
  
  /** Data version number for conflict detection */
  version: number;
  
  /** Entity type being synced (e.g., 'events', 'notes') */
  entityType: string;
  
  /** Entity ID */
  entityId: string;
  
  /** Client-side modification timestamp */
  clientTimestamp: number;
  
  /** Server-side modification timestamp (if known) */
  serverTimestamp?: number;
}

/**
 * Network status with connection quality
 */
export interface NetworkStatus {
  /** Whether browser reports online status */
  isOnline: boolean;
  
  /** Whether device was previously offline (reconnection flag) */
  wasOffline: boolean;
  
  /** Estimated connection quality */
  quality: 'excellent' | 'good' | 'poor' | 'offline';
  
  /** Network type from Network Information API (if available) */
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  
  /** Timestamp of last status check */
  lastChecked: number;
}

/**
 * Auto-save hook options
 */
export interface AutoSaveOptions {
  /** Debounce delay in milliseconds (default: 500) */
  debounceMs?: number;
  
  /** Whether to save immediately without debounce (default: false) */
  immediate?: boolean;
  
  /** Whether to enable auto-save (default: true) */
  enabled?: boolean;
  
  /** Callback when save starts */
  onSaveStart?: () => void;
  
  /** Callback when save succeeds */
  onSaveSuccess?: () => void;
  
  /** Callback when save fails */
  onSaveError?: (error: Error) => void;
}

/**
 * Auto-save hook return value
 */
export interface AutoSaveState {
  /** Whether save is currently in progress */
  isSaving: boolean;
  
  /** Timestamp of last successful save */
  lastSaved: number | null;
  
  /** Last error that occurred during save */
  error: Error | null;
  
  /** Manually trigger a save (bypasses debounce) */
  triggerSave: () => void;
  
  /** Reset error state */
  resetError: () => void;
}

/**
 * Sync engine configuration
 */
export interface SyncEngineConfig {
  /** Maximum retry attempts per request (default: 3) */
  maxRetries?: number;
  
  /** Base delay for exponential backoff in ms (default: 1000) */
  retryDelayMs?: number;
  
  /** Maximum delay between retries in ms (default: 10000) */
  maxRetryDelayMs?: number;
  
  /** Batch size for processing queue (default: 10) */
  batchSize?: number;
  
  /** Whether to process queue in parallel (default: false) */
  parallel?: boolean;
}

/**
 * Sync context value exposed by SyncProvider
 */
export interface SyncContextValue {
  /** Current sync status */
  status: SyncStatus;
  
  /** Sync status (alias for status) */
  syncStatus: SyncStatus;
  
  /** Number of queued requests */
  queueSize: number;
  
  /** Last sync result */
  lastSync: SyncResult | null;
  
  /** Whether sync is currently running */
  isSyncing: boolean;
  
  /** Manually trigger sync operation */
  triggerSync: () => Promise<SyncResult>;
  
  /** Clear all queued requests (caution!) */
  clearQueue: () => void;
}

/**
 * Persistence context value (combines network + sync)
 */
export interface PersistenceContextValue {
  /** Network status */
  isOnline: boolean;
  
  /** Sync status */
  isSyncing: boolean;
  
  /** Number of queued operations */
  queuedCount: number;
  
  /** Last successful sync timestamp */
  lastSync: number | null;
  
  /** Current sync status */
  syncStatus: SyncStatus;
  
  /** Trigger manual sync */
  sync: () => Promise<SyncResult>;
}

/**
 * Event emitted by sync engine
 */
export interface SyncEvent {
  /** Event type */
  type: 'sync-start' | 'sync-complete' | 'sync-error' | 'queue-updated';
  
  /** Event timestamp */
  timestamp: number;
  
  /** Event payload */
  payload?: {
    result?: SyncResult;
    error?: Error;
    queueSize?: number;
  };
}
