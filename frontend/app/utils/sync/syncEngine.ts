/**
 * Sync engine for orchestrating data synchronization
 * 
 * Handles queue processing, conflict resolution, and sync lifecycle events.
 * Automatically triggered on reconnection.
 * 
 * @example
 * ```ts
 * import { startSync, handleSyncConflict } from '~/utils/sync/syncEngine';
 * 
 * // Trigger sync
 * const result = await startSync(true);
 * console.log(`Synced ${result.processed} operations`);
 * 
 * // Handle conflicts
 * const resolved = handleSyncConflict(localData, remoteData, 'server-wins');
 * ```
 */

import type { SyncResult, SyncEngineConfig, SyncConflict } from '~/types/sync';
import type { QueuedRequest } from '~/types/storage';
import { processQueue, getQueueStats } from '~/utils/network/requestQueue';
import { setItem, getItem } from '~/utils/storage/localStorage';

/** Sync metadata storage key */
const SYNC_METADATA_KEY = 'sync_metadata';

/** Default configuration */
const DEFAULT_CONFIG: Required<SyncEngineConfig> = {
  maxRetries: 3,
  retryDelayMs: 1000,
  maxRetryDelayMs: 10000,
  batchSize: 10,
  parallel: false
};

/** Sync event listeners */
type SyncEventListener = (result: SyncResult) => void;
const syncListeners: {
  onSyncStart: SyncEventListener[];
  onSyncComplete: SyncEventListener[];
  onSyncError: SyncEventListener[];
} = {
  onSyncStart: [],
  onSyncComplete: [],
  onSyncError: []
};

/**
 * Register event listener
 * 
 * @param event - Event type
 * @param listener - Callback function
 * @returns Unsubscribe function
 */
export function onSyncEvent(
  event: 'onSyncStart' | 'onSyncComplete' | 'onSyncError',
  listener: SyncEventListener
): () => void {
  syncListeners[event].push(listener);
  
  // Return unsubscribe function
  return () => {
    const index = syncListeners[event].indexOf(listener);
    if (index > -1) {
      syncListeners[event].splice(index, 1);
    }
  };
}

/**
 * Emit sync event to all listeners
 */
function emitSyncEvent(
  event: 'onSyncStart' | 'onSyncComplete' | 'onSyncError',
  result: SyncResult
): void {
  syncListeners[event].forEach((listener) => {
    try {
      listener(result);
    } catch (error) {
      console.error('Sync event listener error:', error);
    }
  });
}

/**
 * Start sync operation
 * 
 * Processes all queued operations and handles errors.
 * 
 * @param isOnline - Whether network is available
 * @param config - Optional configuration overrides
 * @returns Sync result with statistics
 */
export async function startSync(
  isOnline: boolean,
  config: Partial<SyncEngineConfig> = {}
): Promise<SyncResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const startResult: SyncResult = {
    success: false,
    processed: 0,
    failed: 0,
    duration: 0,
    timestamp: Date.now()
  };
  
  // Emit start event
  emitSyncEvent('onSyncStart', startResult);
  
  if (!isOnline) {
    const offlineResult: SyncResult = {
      success: false,
      processed: 0,
      failed: 0,
      duration: 0,
      timestamp: Date.now(),
      error: 'Cannot sync - device is offline'
    };
    
    emitSyncEvent('onSyncError', offlineResult);
    return offlineResult;
  }
  
  try {
    console.log('🔄 Starting sync...');
    
    // Process queue
    const queueResult = await processQueue(isOnline);
    
    // Update sync metadata
    updateSyncMetadata(queueResult.timestamp);
    
    // Emit appropriate event
    if (queueResult.success) {
      emitSyncEvent('onSyncComplete', queueResult);
      console.log('✅ Sync completed successfully');
    } else {
      emitSyncEvent('onSyncError', queueResult);
      console.warn('⚠️ Sync completed with errors');
    }
    
    return queueResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
    
    const errorResult: SyncResult = {
      success: false,
      processed: 0,
      failed: 0,
      duration: 0,
      timestamp: Date.now(),
      error: errorMessage
    };
    
    emitSyncEvent('onSyncError', errorResult);
    console.error('❌ Sync failed:', errorMessage);
    
    return errorResult;
  }
}

/**
 * Sync queued operations (alias for startSync)
 * 
 * @param isOnline - Whether network is available
 * @returns Sync result
 */
export async function syncQueuedOperations(isOnline: boolean): Promise<SyncResult> {
  return startSync(isOnline);
}

/**
 * Handle sync conflict between local and remote data
 * 
 * @param conflict - Conflict data with resolution strategy
 * @returns Resolved data
 */
export function handleSyncConflict<T>(conflict: SyncConflict<T>): T {
  const { local, remote, resolution, localTimestamp, remoteTimestamp } = conflict;
  
  switch (resolution) {
    case 'client-wins':
      console.log(`Conflict resolved: client-wins for ${conflict.id}`);
      return local;
      
    case 'server-wins':
      console.log(`Conflict resolved: server-wins for ${conflict.id}`);
      return remote;
      
    case 'merge':
      // Simple merge strategy - newer timestamp wins per field
      console.log(`Conflict resolved: merge for ${conflict.id}`);
      
      if (typeof local === 'object' && typeof remote === 'object' && local !== null && remote !== null) {
        const merged = { ...remote };
        
        // This is a simple merge - override with local if newer
        if (localTimestamp > remoteTimestamp) {
          Object.assign(merged, local);
        }
        
        return merged as T;
      }
      
      // Fall back to newer timestamp
      return localTimestamp > remoteTimestamp ? local : remote;
      
    case 'manual':
      // Manual resolution required - return local for now
      console.warn(`Manual resolution required for ${conflict.id}`);
      return local;
      
    default:
      console.warn(`Unknown resolution strategy, defaulting to server-wins`);
      return remote;
  }
}

/**
 * Update sync metadata
 * 
 * @param lastSyncTime - Timestamp of last successful sync
 */
export function updateSyncMetadata(lastSyncTime: number): void {
  const metadata = {
    lastSync: lastSyncTime,
    version: 1,
    updatedAt: Date.now()
  };
  
  setItem(SYNC_METADATA_KEY, metadata);
}

/**
 * Get sync metadata
 * 
 * @returns Sync metadata or null if not available
 */
export function getSyncMetadata(): { lastSync: number; version: number; updatedAt: number } | null {
  const result = getItem<{ lastSync: number; version: number; updatedAt: number }>(SYNC_METADATA_KEY);
  return result.success && result.data ? result.data : null;
}

/**
 * Clear successful operations from queue
 * 
 * This is automatically handled by processQueue, but can be called manually
 * if needed for cleanup.
 */
export function clearSuccessfulOperations(): void {
  const stats = getQueueStats();
  console.log(`Queue status: ${stats.pending} pending, ${stats.failed} failed`);
  
  // Note: Individual successful requests are already removed by processQueue
  // This function is here for completeness and future enhancements
}

/**
 * Get sync status summary
 * 
 * @returns Sync status information
 */
export function getSyncStatus(): {
  lastSync: number | null;
  queueSize: number;
  pendingCount: number;
  failedCount: number;
} {
  const metadata = getSyncMetadata();
  const stats = getQueueStats();
  
  return {
    lastSync: metadata?.lastSync || null,
    queueSize: stats.total,
    pendingCount: stats.pending,
    failedCount: stats.failed
  };
}

/**
 * Check if sync is needed
 * 
 * @returns True if there are pending operations
 */
export function isSyncNeeded(): boolean {
  const stats = getQueueStats();
  return stats.pending > 0;
}
