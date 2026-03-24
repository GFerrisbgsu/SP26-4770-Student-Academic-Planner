/**
 * Persistent state hook with automatic saving
 * 
 * Drop-in replacement for useState that automatically saves data
 * to localStorage and optionally syncs with backend.
 * 
 * @example
 * ```tsx
 * import { usePersistentState } from '~/hooks/usePersistentState';
 * 
 * function EventEditor() {
 *   // Replaces: const [events, setEvents] = useState([]);
 *   const [events, setEvents] = usePersistentState(
 *     'custom_events',
 *     [],
 *     async (data) => {
 *       // Optional: Save to backend
 *       await eventService.saveAll(data);
 *     }
 *   );
 *   
 *   // Use normally - auto-saves on changes
 *   const addEvent = () => {
 *     setEvents([...events, newEvent]);
 *   };
 *   
 *   return <div>...</div>;
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import type { AutoSaveOptions } from '~/types/sync';
import { useAutoSave } from '~/hooks/useAutoSave';
import { getItem, setItem as setStorageItem } from '~/utils/storage/localStorage';

/**
 * Hook for persistent state with auto-save
 * 
 * Combines useState + localStorage + optional backend sync.
 * 
 * @param key - Storage key (will be prefixed automatically)
 * @param initialValue - Default value if no stored data exists
 * @param saveFunction - Optional async function to save to backend
 * @param options - Auto-save configuration
 * @returns Tuple of [value, setValue, saveState]
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  saveFunction?: (data: T) => Promise<void>,
  options?: AutoSaveOptions
): [T, (value: T | ((prev: T) => T)) => void, ReturnType<typeof useAutoSave>] {
  // Initialize from localStorage or use initialValue
  const [state, setState] = useState<T>(() => {
    const stored = getItem<T>(key);
    if (stored.success && stored.data !== null && stored.data !== undefined) {
      return stored.data;
    }
    return initialValue;
  });

  /**
   * Update localStorage whenever state changes
   */
  useEffect(() => {
    const result = setStorageItem(key, state);
    
    if (!result.success) {
      console.error(`Failed to persist ${key} to localStorage:`, result.error);
    }
  }, [key, state]);

  /**
   * Optional auto-save to backend
   */
  const autoSaveState = useAutoSave(
    state,
    saveFunction || (async () => {
      // No-op if no save function provided
    }),
    {
      enabled: !!saveFunction,
      ...options
    }
  );

  /**
   * Enhanced setState that works with both direct values and updater functions
   */
  const setStatePersistent = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const newValue = typeof value === 'function' 
          ? (value as (prev: T) => T)(prev)
          : value;
        
        return newValue;
      });
    },
    []
  );

  return [state, setStatePersistent, autoSaveState];
}

/**
 * Simplified hook for localStorage-only persistence (no backend sync)
 * 
 * @example
 * ```tsx
 * const [preferences, setPreferences] = useLocalState('user_preferences', {
 *   theme: 'light',
 *   notifications: true
 * });
 * ```
 */
export function useLocalState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = usePersistentState(key, initialValue);
  return [state, setState];
}
