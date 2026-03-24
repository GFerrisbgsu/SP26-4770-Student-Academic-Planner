/**
 * Persistence context provider
 * 
 * Combines network and sync contexts into a unified interface for
 * accessing persistence status throughout the application.
 * 
 * @example
 * ```tsx
 * // In root.tsx
 * import { PersistenceProvider } from '~/context/PersistenceContext';
 * 
 * export function Layout({ children }) {
 *   return (
 *     <NetworkProvider>
 *       <SyncProvider>
 *         <PersistenceProvider>
 *           {children}
 *         </PersistenceProvider>
 *       </SyncProvider>
 *     </NetworkProvider>
 *   );
 * }
 * 
 * // In any component
 * import { usePersistence } from '~/context/PersistenceContext';
 * 
 * function MyComponent() {
 *   const { isOnline, isSyncing, queuedCount } = usePersistence();
 *   
 *   return (
 *     <div>
 *       Status: {isOnline ? 'Online' : 'Offline'}
 *       {isSyncing && ' - Syncing...'}
 *       {queuedCount > 0 && ` (${queuedCount} pending)`}
 *     </div>
 *   );
 * }
 * ```
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { PersistenceContextValue } from '~/types/sync';
import { useNetwork } from '~/context/NetworkContext';
import { useSync } from '~/context/SyncContext';

/** Persistence context */
const PersistenceContext = createContext<PersistenceContextValue | undefined>(undefined);

/**
 * Persistence provider component
 * 
 * Must be nested within NetworkProvider and SyncProvider.
 * 
 * @param children - Child components
 */
export function PersistenceProvider({ children }: { children: ReactNode }) {
  const { isOnline } = useNetwork();
  const { isSyncing, queueSize, lastSync: lastSyncResult, syncStatus, triggerSync } = useSync();

  const value: PersistenceContextValue = useMemo(
    () => ({
      isOnline,
      isSyncing,
      queuedCount: queueSize,
      lastSync: lastSyncResult?.timestamp || null,
      syncStatus,
      sync: triggerSync
    }),
    [isOnline, isSyncing, queueSize, lastSyncResult?.timestamp, syncStatus, triggerSync]
  );

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}

/**
 * Hook to access persistence context
 * 
 * Provides unified access to network status, sync status, and queue information.
 * 
 * @throws Error if used outside PersistenceProvider
 * @returns Persistence context value
 */
export function usePersistence(): PersistenceContextValue {
  const context = useContext(PersistenceContext);
  
  if (context === undefined) {
    throw new Error('usePersistence must be used within PersistenceProvider');
  }
  
  return context;
}
