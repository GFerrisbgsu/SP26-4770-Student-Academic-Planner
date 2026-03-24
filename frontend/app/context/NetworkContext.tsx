/**
 * Network status context provider
 * 
 * Provides network status globally to all components using React Context.
 * 
 * @example
 * ```tsx
 * // In root.tsx
 * import { NetworkProvider } from '~/context/NetworkContext';
 * 
 * export function Layout({ children }) {
 *   return (
 *     <NetworkProvider>
 *       {children}
 *     </NetworkProvider>
 *   );
 * }
 * 
 * // In any component
 * import { useNetwork } from '~/context/NetworkContext';
 * 
 * function MyComponent() {
 *   const { isOnline, quality } = useNetwork();
 *   
 *   return <div>Status: {isOnline ? 'Online' : 'Offline'}</div>;
 * }
 * ```
 */

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useNetworkStatus } from '~/hooks/useNetworkStatus';
import type { NetworkStatus } from '~/types/sync';

/** Context value type */
interface NetworkContextValue extends NetworkStatus {
  /** Convenience method to check if online */
  checkOnline: () => boolean;
}

/** Network context */
const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

/**
 * Network provider component
 * 
 * Wraps children with network status context.
 * 
 * @param children - Child components
 */
export function NetworkProvider({ children }: { children: ReactNode }) {
  const networkStatus = useNetworkStatus();

  const checkOnline = useCallback(() => networkStatus.isOnline, [networkStatus.isOnline]);

  const value: NetworkContextValue = useMemo(
    () => ({
      ...networkStatus,
      checkOnline
    }),
    [networkStatus, checkOnline]
  );

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

/**
 * Hook to access network status from context
 * 
 * @throws Error if used outside NetworkProvider
 * @returns Network status and utilities
 */
export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  
  if (context === undefined) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  
  return context;
}
