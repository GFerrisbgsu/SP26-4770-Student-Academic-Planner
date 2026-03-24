/**
 * Network status detection hook
 * 
 * Monitors online/offline status using navigator.onLine and network events.
 * Detects reconnection for triggering sync operations.
 * 
 * @example
 * ```tsx
 * import { useNetworkStatus } from '~/hooks/useNetworkStatus';
 * 
 * function MyComponent() {
 *   const { isOnline, wasOffline, quality } = useNetworkStatus();
 *   
 *   if (!isOnline) {
 *     return <div>You are offline. Changes will sync when you reconnect.</div>;
 *   }
 *   
 *   if (wasOffline) {
 *     // Trigger sync on reconnection
 *     syncQueuedOperations();
 *   }
 *   
 *   return <div>Connection: {quality}</div>;
 * }
 * ```
 */

import { useState, useEffect } from 'react';
import type { NetworkStatus } from '~/types/sync';

/**
 * Hook to monitor network status and detect reconnection
 * 
 * Follows the pattern from useIsMobile hook with proper event listener cleanup.
 * 
 * @returns NetworkStatus object with connection information
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    quality: 'excellent',
    lastChecked: Date.now()
  }));

  useEffect(() => {
    // Track previous online state for reconnection detection
    let previousOnlineState = navigator.onLine;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      // wasOffline should be true when we just came BACK online (isOnline=true, previousOnlineState=false)
      const wasOffline = isOnline && !previousOnlineState;
      
      // Determine connection quality using Network Information API (if available)
      let quality: 'excellent' | 'good' | 'poor' | 'offline' = isOnline
        ? 'excellent'
        : 'offline';
      
      if (isOnline && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && 'effectiveType' in connection) {
          const effectiveType = connection.effectiveType;
          
          if (effectiveType === '4g') {
            quality = 'excellent';
          } else if (effectiveType === '3g') {
            quality = 'good';
          } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
            quality = 'poor';
          }
        }
      }
      
      setNetworkStatus({
        isOnline,
        wasOffline,
        quality,
        effectiveType: isOnline && 'connection' in navigator
          ? (navigator as any).connection?.effectiveType
          : undefined,
        lastChecked: Date.now()
      });
      
      // Log status changes BEFORE updating previous state
      if (import.meta.env.DEV) {
        console.log(
          `🌐 Network status: ${isOnline ? 'ONLINE' : 'OFFLINE'}`,
          wasOffline ? '✅ (RECONNECTED - will trigger sync)' : '',
          `[was: ${previousOnlineState ? 'online' : 'offline'} → now: ${isOnline ? 'online' : 'offline'}]`
        );
      }
      
      // Update previous state AFTER logging
      previousOnlineState = isOnline;
    };

    // Event handlers
    const handleOnline = () => {
      console.log('Network: Back online');
      updateNetworkStatus();
    };

    const handleOffline = () => {
      console.warn('Network: Gone offline');
      updateNetworkStatus();
    };

    // Listen to online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen to connection change events (if available)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateNetworkStatus);
      }
    }

    // Initial status check
    updateNetworkStatus();

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateNetworkStatus);
        }
      }
    };
  }, []);

  return networkStatus;
}
