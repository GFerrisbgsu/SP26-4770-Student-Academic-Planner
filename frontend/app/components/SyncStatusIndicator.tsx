/**
 * Sync status indicator component
 * 
 * Displays current sync status with visual feedback for saving, offline mode,
 * and queued operations. Fixed position indicator for persistent visibility.
 * 
 * @example
 * ```tsx
 * import { SyncStatusIndicator } from '~/components/SyncStatusIndicator';
 * 
 * // In root layout
 * <SyncStatusIndicator />
 * ```
 */

import { useEffect, useState } from 'react';
import { Cloud, CloudOff, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { usePersistence } from '~/context/PersistenceContext';
import { cn } from '~/components/ui/utils';

export function SyncStatusIndicator() {
  const { isOnline, isSyncing, queuedCount, lastSync, syncStatus } = usePersistence();
  const [showIndicator, setShowIndicator] = useState(true);
  const [lastSyncText, setLastSyncText] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Only render on client to prevent hydration mismatch
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Update last sync time text
   */
  useEffect(() => {
    if (!lastSync) {
      setLastSyncText('');
      return;
    }

    const updateText = () => {
      const now = Date.now();
      const diff = now - lastSync;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 10) {
        setLastSyncText('Just now');
      } else if (seconds < 60) {
        setLastSyncText(`${seconds}s ago`);
      } else if (minutes < 60) {
        setLastSyncText(`${minutes}m ago`);
      } else if (hours < 24) {
        setLastSyncText(`${hours}h ago`);
      } else {
        setLastSyncText(new Date(lastSync).toLocaleDateString());
      }
    };

    updateText();
    const interval = setInterval(updateText, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSync]);

  /**
   * Auto-hide when idle and synced
   */
  useEffect(() => {
    if (isSyncing || !isOnline || queuedCount > 0 || syncStatus === 'error') {
      setShowIndicator(true);
      return;
    }

    // Auto-hide after 3 seconds when saved successfully
    const timeout = setTimeout(() => {
      setShowIndicator(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isSyncing, isOnline, queuedCount, syncStatus]);

  /**
   * Determine status display
   */
  const getStatusDisplay = () => {
    if (!isOnline) {
      return {
        icon: CloudOff,
        text: queuedCount > 0 ? `Offline - ${queuedCount} queued` : 'Offline',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        iconColor: 'text-yellow-600'
      };
    }

    if (isSyncing) {
      return {
        icon: Loader2,
        text: 'Saving...',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600',
        spin: true
      };
    }

    if (syncStatus === 'error') {
      return {
        icon: AlertCircle,
        text: 'Sync failed',
        color: 'text-red-600 bg-red-50 border-red-200',
        iconColor: 'text-red-600'
      };
    }

    if (queuedCount > 0) {
      return {
        icon: Clock,
        text: `${queuedCount} pending`,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        iconColor: 'text-orange-600'
      };
    }

    // Saved successfully
    return {
      icon: CheckCircle2,
      text: lastSyncText ? `Saved ${lastSyncText}` : 'Saved',
      color: 'text-green-600 bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    };
  };

  const status = getStatusDisplay();
  const Icon = status.icon;

  // Don't render during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Don't render if hidden
  if (!showIndicator && syncStatus === 'idle' && queuedCount === 0 && isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'flex items-center gap-2 px-3 py-2 rounded-lg',
        'border shadow-sm',
        'transition-all duration-300 ease-in-out',
        'hover:shadow-md',
        status.color
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn(
          'h-4 w-4',
          status.iconColor,
          status.spin && 'animate-spin'
        )}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">
        {status.text}
      </span>
    </div>
  );
}
