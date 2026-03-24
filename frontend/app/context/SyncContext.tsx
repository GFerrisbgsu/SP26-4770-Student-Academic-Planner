/**
 * Sync context provider
 * 
 * Manages sync operations and provides sync status to all components.
 * Automatically triggers sync on reconnection.
 * 
 * @example
 * ```tsx
 * // In root.tsx
 * import { SyncProvider } from '~/context/SyncContext';
 * 
 * export function Layout({ children }) {
 *   return (
 *     <NetworkProvider>
 *       <SyncProvider>
 *         {children}
 *       </SyncProvider>
 *     </NetworkProvider>
 *   );
 * }
 * 
 * // In any component
 * import { useSync } from '~/context/SyncContext';
 * 
 * function MyComponent() {
 *   const { isSyncing, queueSize, triggerSync } = useSync();
 *   
 *   return (
 *     <div>
 *       {isSyncing ? 'Syncing...' : `${queueSize} items queued`}
 *       <button onClick={triggerSync}>Sync Now</button>
 *     </div>
 *   );
 * }
 * ```
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { SyncContextValue, SyncResult } from '~/types/sync';
import type { SyncStatus } from '~/types/storage';
import { useNetwork } from '~/context/NetworkContext';
import { startSync, onSyncEvent, getSyncStatus, isSyncNeeded } from '~/utils/sync/syncEngine';
import { getQueueStats } from '~/utils/network/requestQueue';

/** Sync context */
const SyncContext = createContext<SyncContextValue | undefined>(undefined);

/**
 * Sync provider component
 * 
 * Wraps children with sync context and handles automatic sync on reconnection.
 * 
 * @param children - Child components
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { isOnline, wasOffline } = useNetwork();
  
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [queueSize, setQueueSize] = useState(0);
  const [lastSync, setLastSync] = useState<SyncResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Update queue size
   */
  const updateQueueSize = useCallback(() => {
    const stats = getQueueStats();
    setQueueSize(stats.total);
  }, []);

  /**
   * Trigger manual sync
   */
  const triggerSync = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing) {
      console.warn('Sync already in progress');
      return lastSync || {
        success: false,
        processed: 0,
        failed: 0,
        duration: 0,
        timestamp: Date.now(),
        error: 'Sync already in progress'
      };
    }
    
    setIsSyncing(true);
    setStatus('syncing');
    
    try {
      const result = await startSync(isOnline);
      
      setLastSync(result);
      setStatus(result.success ? 'idle' : 'error');
      updateQueueSize();
      
      return result;
    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        processed: 0,
        failed: 0,
        duration: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setLastSync(errorResult);
      setStatus('error');
      
      return errorResult;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, lastSync, updateQueueSize]);

  /**
   * Clear queue (use with caution)
   */
  const clearQueue = useCallback(() => {
    // This would call clearQueue from localStorage
    // For now, just update the queue size
    updateQueueSize();
  }, [updateQueueSize]);

  /**
   * Auto-sync on reconnection
   */
  useEffect(() => {
    console.log('🔍 Auto-sync check:', {
      wasOffline,
      isOnline,
      syncNeeded: isSyncNeeded(),
      queueSize
    });
    
    if (wasOffline && isOnline && isSyncNeeded()) {
      console.log('🔄 Reconnected - triggering auto-sync');
      triggerSync();
    }
  }, [wasOffline, isOnline, triggerSync, queueSize]);

  /**
   * Update status based on network
   */
  useEffect(() => {
    if (!isOnline && !isSyncing) {
      setStatus('offline');
    } else if (!isSyncing && status === 'offline') {
      setStatus('idle');
    }
  }, [isOnline, isSyncing, status]);

  /**
   * Subscribe to sync events
   */
  useEffect(() => {
    const unsubscribeStart = onSyncEvent('onSyncStart', () => {
      setIsSyncing(true);
      setStatus('syncing');
    });
    
    const unsubscribeComplete = onSyncEvent('onSyncComplete', (result) => {
      setLastSync(result);
      setIsSyncing(false);
      setStatus('idle');
      updateQueueSize();
    });
    
    const unsubscribeError = onSyncEvent('onSyncError', (result) => {
      setLastSync(result);
      setIsSyncing(false);
      setStatus('error');
      updateQueueSize();
    });
    
    return () => {
      unsubscribeStart();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [updateQueueSize]);

  /**
   * Initialize queue size
   */
  useEffect(() => {
    updateQueueSize();
    
    // Poll queue size periodically (every 5 seconds)
    const interval = setInterval(updateQueueSize, 5000);
    
    return () => clearInterval(interval);
  }, [updateQueueSize]);

  const value: SyncContextValue = {
    status,
    queueSize,
    lastSync,
    isSyncing,
    triggerSync,
    clearQueue,
    syncStatus: status
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

/**
 * Hook to access sync context
 * 
 * @throws Error if used outside SyncProvider
 * @returns Sync context value
 */
export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  
  if (context === undefined) {
    throw new Error('useSync must be used within SyncProvider');
  }
  
  return context;
}
