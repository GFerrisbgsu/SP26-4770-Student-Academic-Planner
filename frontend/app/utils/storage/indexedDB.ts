/**
 * IndexedDB wrapper for large data storage
 * 
 * Provides Promise-based API for IndexedDB operations, suitable for storing
 * large datasets (event history, bulk notes) that exceed localStorage limits.
 * 
 * @example
 * ```ts
 * import { initDB, saveToStore, getFromStore } from '~/utils/storage/indexedDB';
 * 
 * // Initialize database
 * await initDB('sapDB', 1);
 * 
 * // Save event history
 * await saveToStore('events', {
 *   id: 'event-123',
 *   title: 'CS 4770 Lecture',
 *   timestamp: Date.now()
 * });
 * 
 * // Retrieve event
 * const event = await getFromStore('events', 'event-123');
 * ```
 */

import type { IndexedDBConfig } from '~/types/storage';

/** Default database name */
const DB_NAME = 'StudentAcademicPlanner';

/** Default database version */
const DB_VERSION = 1;

/** Database instance cache */
let dbInstance: IDBDatabase | null = null;

/**
 * Default database schema configuration
 */
const DEFAULT_CONFIG: IndexedDBConfig = {
  name: DB_NAME,
  version: DB_VERSION,
  stores: [
    {
      name: 'events',
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp', options: { unique: false } },
        { name: 'userId', keyPath: 'userId', options: { unique: false } }
      ]
    },
    {
      name: 'notes',
      keyPath: 'id',
      indexes: [
        { name: 'courseId', keyPath: 'courseId', options: { unique: false } },
        { name: 'lastEdited', keyPath: 'lastEdited', options: { unique: false } }
      ]
    },
    {
      name: 'syncMetadata',
      keyPath: 'entityId'
    }
  ]
};

/**
 * Initialize IndexedDB with schema
 * 
 * @param name - Database name (default: StudentAcademicPlanner)
 * @param version - Database version (default: 1)
 * @param config - Optional custom configuration
 * @returns Promise resolving to database instance
 */
export function initDB(
  name: string = DB_NAME,
  version: number = DB_VERSION,
  config?: Partial<IndexedDBConfig>
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    
    const mergedConfig = { ...DEFAULT_CONFIG, ...config, name, version };
    const request = indexedDB.open(mergedConfig.name, mergedConfig.version);
    
    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };
    
    request.onsuccess = () => {
      dbInstance = request.result;
      console.log(`IndexedDB initialized: ${mergedConfig.name} v${mergedConfig.version}`);
      resolve(dbInstance);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      mergedConfig.stores.forEach((storeConfig) => {
        // Skip if store already exists
        if (db.objectStoreNames.contains(storeConfig.name)) {
          return;
        }
        
        const store = db.createObjectStore(storeConfig.name, {
          keyPath: storeConfig.keyPath
        });
        
        // Create indexes
        if (storeConfig.indexes) {
          storeConfig.indexes.forEach((indexConfig) => {
            store.createIndex(
              indexConfig.name,
              indexConfig.keyPath,
              indexConfig.options
            );
          });
        }
        
        console.log(`Created object store: ${storeConfig.name}`);
      });
    };
  });
}

/**
 * Get database instance (initializes if needed)
 * 
 * @returns Promise resolving to database instance
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  
  return initDB();
}

/**
 * Save data to an object store
 * 
 * @param storeName - Name of the object store
 * @param data - Data to save (must include key matching keyPath)
 * @returns Promise resolving when save completes
 */
export async function saveToStore<T>(storeName: string, data: T): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to save to ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Save multiple items to store in a single transaction
 * 
 * @param storeName - Name of the object store
 * @param items - Array of items to save
 * @returns Promise resolving when all saves complete
 */
export async function saveBulkToStore<T>(
  storeName: string,
  items: T[]
): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    let completed = 0;
    const total = items.length;
    
    items.forEach((item) => {
      const request = store.put(item);
      
      request.onsuccess = () => {
        completed++;
        if (completed === total) {
          resolve();
        }
      };
      
      request.onerror = () => {
        reject(new Error(`Bulk save failed: ${request.error?.message}`));
      };
    });
    
    if (items.length === 0) {
      resolve();
    }
  });
}

/**
 * Get data from object store by key
 * 
 * @param storeName - Name of the object store
 * @param key - Key value to retrieve
 * @returns Promise resolving to data or undefined if not found
 */
export async function getFromStore<T>(
  storeName: string,
  key: IDBValidKey
): Promise<T | undefined> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to get from ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Get all data from object store
 * 
 * @param storeName - Name of the object store
 * @returns Promise resolving to array of all items
 */
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result as T[]);
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to get all from ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Delete data from object store
 * 
 * @param storeName - Name of the object store
 * @param key - Key value to delete
 * @returns Promise resolving when delete completes
 */
export async function deleteFromStore(
  storeName: string,
  key: IDBValidKey
): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to delete from ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Clear all data from object store
 * 
 * @param storeName - Name of the object store
 * @returns Promise resolving when clear completes
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => {
      console.log(`Cleared object store: ${storeName}`);
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to clear ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Query object store by index
 * 
 * @param storeName - Name of the object store
 * @param indexName - Name of the index
 * @param value - Value to query for
 * @returns Promise resolving to array of matching items
 */
export async function queryByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    
    request.onsuccess = () => {
      resolve(request.result as T[]);
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to query ${storeName} by ${indexName}: ${request.error?.message}`));
    };
  });
}

/**
 * Count items in object store
 * 
 * @param storeName - Name of the object store
 * @returns Promise resolving to count
 */
export async function countStore(storeName: string): Promise<number> {
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to count ${storeName}: ${request.error?.message}`));
    };
  });
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('IndexedDB connection closed');
  }
}

/**
 * Delete entire database (use with extreme caution!)
 * 
 * @param name - Database name to delete
 * @returns Promise resolving when deletion completes
 */
export async function deleteDB(name: string = DB_NAME): Promise<void> {
  closeDB();
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    
    request.onsuccess = () => {
      console.log(`Database ${name} deleted`);
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Failed to delete database: ${request.error?.message}`));
    };
  });
}

/**
 * Check if IndexedDB is supported
 * 
 * @returns True if IndexedDB is available
 */
export function isIndexedDBSupported(): boolean {
  return 'indexedDB' in window;
}
