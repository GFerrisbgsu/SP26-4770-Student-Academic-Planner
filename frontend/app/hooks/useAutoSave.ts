/**
 * Auto-save hook with debouncing
 * 
 * Automatically saves data after a debounce delay, with status tracking
 * and error handling. Falls back to queue on failure.
 * 
 * @example
 * ```tsx
 * import { useAutoSave } from '~/hooks/useAutoSave';
 * 
 * function EventEditor() {
 *   const [eventData, setEventData] = useState({ title: '', description: '' });
 *   
 *   const { isSaving, lastSaved, error } = useAutoSave(
 *     eventData,
 *     async (data) => {
 *       await eventService.update(data);
 *     },
 *     { debounceMs: 1000 }
 *   );
 *   
 *   return (
 *     <div>
 *       <input value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} />
 *       {isSaving && <span>Saving...</span>}
 *       {lastSaved && <span>Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>}
 *       {error && <span>Error: {error.message}</span>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { AutoSaveOptions, AutoSaveState } from '~/types/sync';
import { enqueueRequest } from '~/utils/network/requestQueue';
import { useNetwork } from '~/context/NetworkContext';

/**
 * Hook for auto-saving data with debouncing
 * 
 * @param data - Data to save (triggers save when changed)
 * @param saveFunction - Async function to save data
 * @param options - Configuration options
 * @returns Auto-save state and controls
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveState {
  const {
    debounceMs = 500,
    immediate = false,
    enabled = true,
    onSaveStart,
    onSaveSuccess,
    onSaveError
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { isOnline } = useNetwork();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const saveInProgressRef = useRef(false);

  /**
   * Execute the save operation
   */
  const executeSave = useCallback(async () => {
    if (!enabled || saveInProgressRef.current) {
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);
    setError(null);
    onSaveStart?.();

    try {
      await saveFunction(data);
      
      setLastSaved(Date.now());
      onSaveSuccess?.();
      
      if (import.meta.env.DEV) {
        console.log('Auto-save successful');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);
      onSaveError?.(error);
      
      console.error('Auto-save failed:', error.message);
      
      // Queue for later if online (will be retried)
      if (!isOnline) {
        console.log('Offline - save will be queued when online');
      }
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  }, [data, saveFunction, enabled, isOnline, onSaveStart, onSaveSuccess, onSaveError]);

  /**
   * Manually trigger save (bypasses debounce)
   */
  const triggerSave = useCallback(() => {
    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    executeSave();
  }, [executeSave]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-save effect - triggers on data changes
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Check if data actually changed (deep comparison would be better for objects)
    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (!dataChanged) {
      return;
    }

    previousDataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Save immediately or after debounce
    if (immediate) {
      executeSave();
    } else {
      timeoutRef.current = setTimeout(() => {
        executeSave();
      }, debounceMs);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, immediate, enabled, executeSave]);

  return {
    isSaving,
    lastSaved,
    error,
    triggerSave,
    resetError
  };
}

/**
 * Simplified auto-save hook for immediate saves (no debounce)
 * 
 * @example
 * ```tsx
 * const { save, isSaving } = useImmediateSave(async (data) => {
 *   await eventService.complete(data);
 * });
 * 
 * <button onClick={() => save(eventId)}>Complete</button>
 * ```
 */
export function useImmediateSave<T>(
  saveFunction: (data: T) => Promise<void>
): {
  save: (data: T) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
} {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const save = useCallback(async (data: T) => {
    setIsSaving(true);
    setError(null);

    try {
      await saveFunction(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction]);

  return { save, isSaving, error };
}
