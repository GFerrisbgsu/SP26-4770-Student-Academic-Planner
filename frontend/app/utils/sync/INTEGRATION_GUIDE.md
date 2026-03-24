# Auto-Save Integration Guide

Complete guide for integrating the resilient persistence layer with existing and new features in the Student Academic Planner application.

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Integration Patterns](#integration-patterns)
- [Example Implementations](#example-implementations)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

The persistence infrastructure provides three core capabilities:

1. **Auto-save with debouncing** (`useAutoSave`) - Automatically saves data after changes
2. **Offline support** (`requestQueue`) - Queues operations when offline
3. **Automatic sync** (`syncEngine`) - Syncs queued operations on reconnection

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                       │
│  (Components use hooks: useAutoSave, usePersistentState)    │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   Persistence Context                       │
│     (Combines NetworkContext + SyncContext)                 │
│     Access via: usePersistence()                            │
└───────┬────────────────────────────────┬────────────────────┘
        │                                │
┌───────▼────────────┐          ┌────────▼───────────────────┐
│  Network Layer     │          │   Sync Layer               │
│  - useNetworkStatus│          │   - syncEngine             │
│  - Online/offline  │          │   - processQueue           │
└───────┬────────────┘          └────────┬───────────────────┘
        │                                │
┌───────▼────────────────────────────────▼───────────────────┐
│                   Storage Layer                            │
│   - localStorage (queue + metadata)                        │
│   - IndexedDB (bulk data)                                  │
└────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Basic Auto-Save (Text Input)

For text fields, descriptions, or any data that changes frequently:

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

function EventDescriptionEditor({ eventId }: { eventId: string }) {
  const [description, setDescription] = useState('');
  
  // Auto-save with 1 second debounce
  const { isSaving, lastSaved, error } = useAutoSave(
    description,
    async (data) => {
      await eventService.updateDescription(eventId, data);
    },
    { debounceMs: 1000 }
  );
  
  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Event description..."
      />
      {isSaving && <span>Saving...</span>}
      {lastSaved && <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>}
      {error && <span className="text-red-600">Error: {error.message}</span>}
    </div>
  );
}
```

### 2. Immediate Save (Actions)

For button clicks, toggles, or actions that should save immediately:

```tsx
import { useImmediateSave } from '~/hooks/useAutoSave';

function TodoItem({ task }: { task: Task }) {
  const { save, isSaving } = useImmediateSave(async (taskId: string) => {
    await taskService.complete(taskId);
  });
  
  return (
    <button
      onClick={() => save(task.id)}
      disabled={isSaving}
    >
      {isSaving ? 'Completing...' : 'Complete Task'}
    </button>
  );
}
```

### 3. Persistent State (Drop-in useState Replacement)

For maintaining state across page refreshes with optional backend sync:

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

function CourseColorPicker() {
  // Replaces: const [courseColors, setCourseColors] = useState({});
  const [courseColors, setCourseColors] = usePersistentState(
    'course_colors',
    {},
    async (colors) => {
      await preferencesService.saveColors(colors);
    },
    { debounceMs: 500 }
  );
  
  const updateColor = (courseId: string, color: string) => {
    setCourseColors((prev) => ({ ...prev, [courseId]: color }));
    // Auto-saves to localStorage immediately
    // Syncs to backend after 500ms debounce
  };
  
  return <div>...</div>;
}
```

---

## Integration Patterns

### Pattern 1: Migrate Existing useState

**Before:**
```tsx
const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);

const handleAddEvent = (event: CalendarEvent) => {
  setCustomEvents([...customEvents, event]);
};
```

**After:**
```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

const [customEvents, setCustomEvents] = usePersistentState(
  'custom_events',
  [],
  async (events) => {
    // Save to backend when API is ready
    await eventService.saveAll(events);
  }
);

const handleAddEvent = (event: CalendarEvent) => {
  setCustomEvents([...customEvents, event]);
  // Automatically persists to localStorage and queues backend sync
};
```

### Pattern 2: Create New Backend-Connected Feature

**Step 1: Create Entity (Backend)**
```java
// backend/src/main/java/com/sap/model/Event.java
@Entity
public class Event {
    @Id @GeneratedValue
    private Long id;
    private String title;
    private String description;
    // ... other fields
}
```

**Step 2: Create Service (Frontend)**
```tsx
// frontend/app/services/eventService.ts
import { BaseService } from '~/services/baseService';

export class EventService extends BaseService<Event, CreateEventRequest> {
  constructor() {
    super('/events');
  }
  
  async updateDescription(id: string, description: string): Promise<Event> {
    return this.patch(`/${id}`, { description });
  }
}

export const eventService = new EventService();
```

**Step 3: Use in Component**
```tsx
// frontend/app/components/EventEditor.tsx
import { useAutoSave } from '~/hooks/useAutoSave';
import { eventService } from '~/services/eventService';

function EventEditor({ eventId }: { eventId: string }) {
  const [description, setDescription] = useState('');
  
  const { isSaving } = useAutoSave(
    description,
    async (data) => {
      await eventService.updateDescription(eventId, data);
    },
    { debounceMs: 1000 }
  );
  
  return <textarea value={description} onChange={(e) => setDescription(e.target.value)} />;
}
```

### Pattern 3: Offline-First Feature

For features that should work seamlessly offline:

```tsx
import { usePersistence } from '~/context/PersistenceContext';
import { usePersistentState } from '~/hooks/usePersistentState';

function NoteEditor({ courseId }: { courseId: string }) {
  const { isOnline, queuedCount } = usePersistence();
  
  const [notes, setNotes] = usePersistentState(
    `notes_${courseId}`,
    [],
    async (noteList) => {
      await noteService.saveAll(courseId, noteList);
    }
  );
  
  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-50 p-2">
          Offline - {queuedCount} changes queued
        </div>
      )}
      {/* Note editing UI */}
    </div>
  );
}
```

---

## Example Implementations

### Example 1: Custom Events (Complete)

```tsx
// frontend/app/routes/home.tsx
import { usePersistentState } from '~/hooks/usePersistentState';
import { eventService } from '~/services/eventService';

export default function Home() {
  const [customEvents, setCustomEvents] = usePersistentState<CalendarEvent[]>(
    'custom_events',
    [],
    async (events) => {
      // Sync entire list (or implement differential sync)
      await eventService.syncCustomEvents(events);
    },
    { debounceMs: 500 }
  );
  
  const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const event = {
      ...newEvent,
      id: `custom-${Date.now()}-${Math.random()}`
    };
    
    setCustomEvents((prev) => [...prev, event]);
    // Auto-saves to localStorage
    // Queues backend sync after 500ms
  };
  
  const handleRemoveEvent = (eventId: string) => {
    setCustomEvents((prev) => prev.filter((e) => e.id !== eventId));
    // Auto-saves and syncs
  };
  
  return (
    <CalendarView
      customEvents={customEvents}
      onAddEvent={handleAddEvent}
      onRemoveEvent={handleRemoveEvent}
    />
  );
}
```

### Example 2: Event Descriptions

```tsx
// frontend/app/routes/event.tsx
import { useAutoSave } from '~/hooks/useAutoSave';
import { eventService } from '~/services/eventService';

export default function EventPage({ params }: { params: { eventId: string } }) {
  const [description, setDescription] = useState('');
  
  // Load initial data
  useEffect(() => {
    eventService.getById(params.eventId).then((event) => {
      setDescription(event.description || '');
    });
  }, [params.eventId]);
  
  // Auto-save changes
  const { isSaving, error } = useAutoSave(
    description,
    async (data) => {
      await eventService.updateDescription(params.eventId, data);
    },
    { debounceMs: 1000 }
  );
  
  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {isSaving && <Badge>Saving...</Badge>}
      {error && <Alert variant="destructive">{error.message}</Alert>}
    </div>
  );
}
```

### Example 3: Task Completion

```tsx
// frontend/app/components/ToDoSidebar.tsx
import { useImmediateSave } from '~/hooks/useAutoSave';
import { eventService } from '~/services/eventService';

function ToDoItem({ event }: { event: CalendarEvent }) {
  const [isCompleted, setIsCompleted] = useState(false);
  const { save, isSaving } = useImmediateSave(async (eventId: string) => {
    await eventService.complete(eventId);
  });
  
  const handleToggle = async () => {
    setIsCompleted(true); // Optimistic update
    try {
      await save(event.id);
    } catch (error) {
      setIsCompleted(false); // Rollback on error
    }
  };
  
  return (
    <button onClick={handleToggle} disabled={isSaving}>
      {isCompleted ? '✓' : '○'} {event.title}
    </button>
  );
}
```

---

## API Reference

### Hooks

#### `useAutoSave<T>`
Automatically saves data with debouncing.

```tsx
const { isSaving, lastSaved, error, triggerSave, resetError } = useAutoSave(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options?: {
    debounceMs?: number;      // Default: 500
    immediate?: boolean;       // Default: false
    enabled?: boolean;         // Default: true
    onSaveStart?: () => void;
    onSaveSuccess?: () => void;
    onSaveError?: (error: Error) => void;
  }
);
```

#### `useImmediateSave<T>`
For immediate saves without debouncing.

```tsx
const { save, isSaving, error } = useImmediateSave(
  saveFunction: (data: T) => Promise<void>
);
```

#### `usePersistentState<T>`
Drop-in replacement for useState with auto-save.

```tsx
const [state, setState, autoSaveState] = usePersistentState(
  key: string,
  initialValue: T,
  saveFunction?: (data: T) => Promise<void>,
  options?: AutoSaveOptions
);
```

#### `useLocalState<T>`
localStorage-only persistence (no backend).

```tsx
const [state, setState] = useLocalState(key: string, initialValue: T);
```

#### `usePersistence`
Access global persistence status.

```tsx
const {
  isOnline,
  isSyncing,
  queuedCount,
  lastSync,
  syncStatus,
  sync
} = usePersistence();
```

### Services

#### `BaseService<T, CreateDTO, UpdateDTO>`
Base class for API services with offline support.

```tsx
export class MyService extends BaseService<MyType, CreateDTO> {
  constructor() {
    super('/my-endpoint');
  }
  
  // Inherited methods:
  // - getAll(): Promise<T[]>
  // - getById(id): Promise<T>
  // - create(dto): Promise<T>
  // - update(id, dto): Promise<T>
  // - patch(path, dto): Promise<T>
  // - delete(id): Promise<void>
}
```

### Utilities

#### Request Queue
```tsx
import { enqueueRequest, processQueue, getQueueStats } from '~/utils/network/requestQueue';

// Manual queueing (usually automatic)
await enqueueRequest({
  endpoint: '/api/events',
  method: 'POST',
  payload: { title: 'New Event' }
});

// Manual sync trigger (usually automatic)
const result = await processQueue(isOnline);
```

#### Storage
```tsx
import { setItem, getItem, removeItem } from '~/utils/storage/localStorage';

// Type-safe storage
setItem('my_key', { data: 'value' });
const { data } = getItem<MyType>('my_key');
```

---

## Troubleshooting

### Issue: Changes not saving

**Symptoms:** Data disappears on page refresh

**Causes:**
1. Not using `usePersistentState` or `useAutoSave`
2. localStorage disabled/full
3. Backend endpoint not implemented

**Solutions:**
```tsx
// Check if storage is available
import { isStorageAvailable } from '~/utils/storage/localStorage';

if (!isStorageAvailable()) {
  console.error('localStorage not available');
}

// Check queue status
import { getQueueStats } from '~/utils/network/requestQueue';
const stats = getQueueStats();
console.log('Queued operations:', stats.total);
```

### Issue: Sync not triggering on reconnection

**Symptoms:** Queue doesn't process when coming back online

**Causes:**
1. NetworkProvider not mounted
2. SyncProvider not receiving network events

**Solutions:**
```tsx
// Verify providers in root.tsx
<NetworkProvider>
  <SyncProvider>
    <PersistenceProvider>
      {children}
    </PersistenceProvider>
  </SyncProvider>
</NetworkProvider>

// Manually trigger sync
import { usePersistence } from '~/context/PersistenceContext';

const { sync } = usePersistence();
await sync(); // Manual sync
```

### Issue: Duplicate saves

**Symptoms:** Multiple save requests for single change

**Causes:**
1. `debounceMs` too short
2. Multiple `useAutoSave` hooks for same data

**Solutions:**
```tsx
// Increase debounce time
const { isSaving } = useAutoSave(data, saveFn, {
  debounceMs: 1000 // Increase from default 500ms
});

// Ensure single auto-save per data source
// ❌ Don't do this:
useAutoSave(data, saveFn1);
useAutoSave(data, saveFn2);

// ✅ Do this:
useAutoSave(data, async (d) => {
  await saveFn1(d);
  await saveFn2(d);
});
```

### Issue: localStorage quota exceeded

**Symptoms:** `QuotaExceededError` in console

**Solutions:**
```tsx
// Check quota
import { getStorageQuota } from '~/utils/storage/localStorage';

const quota = await getStorageQuota();
if (quota?.isNearLimit) {
  console.warn('Storage nearly full:', quota.usagePercent);
}

// Clear old data
import { clearAllData } from '~/utils/storage/localStorage';
clearAllData(true); // Preserves queue

// Use IndexedDB for large data
import { saveToStore } from '~/utils/storage/indexedDB';
await saveToStore('events', largeEventArray);
```

### Issue: Failed requests not retrying

**Symptoms:** Failed operations stay in queue

**Causes:**
1. Max retries exceeded (3 attempts)
2. Network still offline

**Solutions:**
```tsx
// Check queue stats
import { getQueueStats } from '~/utils/network/requestQueue';

const stats = getQueueStats();
console.log('Failed requests:', stats.failed);

// Clear failed requests (manual)
import { clearQueue } from '~/utils/storage/localStorage';
clearQueue(); // Use with caution!
```

---

## Best Practices

### 1. Choose the Right Hook

- **Text inputs, descriptions:** `useAutoSave` with 1000ms debounce
- **Button clicks, toggles:** `useImmediateSave`
- **State persistence:** `usePersistentState`
- **Preferences, settings:** `useLocalState` (localStorage only)

### 2. Error Handling

Always handle errors gracefully:

```tsx
const { error, resetError } = useAutoSave(data, saveFn);

useEffect(() => {
  if (error) {
    toast.error(`Save failed: ${error.message}`);
    // Optional: Retry or queue for later
  }
}, [error]);
```

### 3. Loading States

Show user feedback during saves:

```tsx
const { isSaving, lastSaved } = useAutoSave(data, saveFn);

return (
  <div>
    {isSaving && <Spinner />}
    {lastSaved && <span>Last saved: {formatTime(lastSaved)}</span>}
  </div>
);
```

### 4. Optimistic Updates

Update UI immediately, rollback on error:

```tsx
const [items, setItems] = useState([]);
const { save } = useImmediateSave(itemService.create);

const addItem = async (item) => {
  // Optimistic add
  setItems([...items, item]);
  
  try {
    await save(item);
  } catch (error) {
    // Rollback
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast.error('Failed to add item');
  }
};
```

### 5. Debounce Timing

- **Frequent changes (typing):** 1000-2000ms
- **Moderate changes (selections):** 500-1000ms
- **Infrequent changes (settings):** 300-500ms
- **Critical actions (save button):** Immediate (0ms)

---

## Next Steps

1. **Implement first feature:** Start with custom events (highest priority)
2. **Create backend endpoints:** Follow the patterns in backend.instructions.md
3. **Test offline behavior:** Use DevTools Network tab to simulate offline
4. **Monitor queue:** Check console logs for queue operations
5. **Iterate:** Add auto-save to each feature as backend is implemented

---

**Questions or Issues?**
- Check console logs (dev mode shows detailed sync operations)
- Inspect localStorage: `Application > Storage > Local Storage`
- Review network requests: `Network > XHR`
- Check queue stats: `getQueueStats()` in browser console
