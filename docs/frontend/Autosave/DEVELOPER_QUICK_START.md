# Developer Quick Start: Using Persistence in Your Features

**Quick reference for adding auto-save, offline support, and persistence to your story cards.**

---

## 🎯 What You Get

✅ **Auto-save** - Changes save automatically (no save button needed)  
✅ **Offline mode** - App works without internet, syncs when back online  
✅ **Persistence** - Data survives page refreshes  
✅ **Visual feedback** - Users see "Saving...", "Saved", "Offline" indicators  

---

## 📦 Three Hooks, Three Use Cases

### 1️⃣ `useAutoSave` - For Text Fields & Forms

**When to use:** User types text, selects options, or makes gradual changes  
**Behavior:** Waits 1 second after they stop typing, then saves  

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

function EventDescription({ eventId }: { eventId: string }) {
  const [description, setDescription] = useState('');
  
  const { isSaving, lastSaved } = useAutoSave(
    description,                    // Data to save
    async (data) => {              // Save function
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ description: data })
      });
    },
    { debounceMs: 1000 }           // Wait 1 second after typing stops
  );
  
  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Type event description..."
      />
      {isSaving && <span>💾 Saving...</span>}
      {lastSaved && <span>✅ Saved</span>}
    </div>
  );
}
```

**Real examples in our project:**
- Event descriptions/notes
- Budget planner amount fields
- Custom event details
- User profile bio

---

### 2️⃣ `useImmediateSave` - For Buttons & Checkboxes

**When to use:** User clicks a button or checkbox - needs instant save  
**Behavior:** Saves immediately on action (no delay)  

```tsx
import { useImmediateSave } from '~/hooks/useAutoSave';

function TaskCheckbox({ taskId }: { taskId: string }) {
  const { save, isSaving } = useImmediateSave(
    async (id: string) => {
      await fetch(`/api/tasks/${id}/complete`, { method: 'POST' });
    }
  );
  
  return (
    <button
      onClick={() => save(taskId)}
      disabled={isSaving}
    >
      {isSaving ? '⏳ Completing...' : '✓ Complete Task'}
    </button>
  );
}
```

**Real examples in our project:**
- Marking tasks complete
- Favoriting courses
- Event RSVP buttons
- Delete confirmations

---

### 3️⃣ `usePersistentState` - Drop-in useState Replacement

**When to use:** Replace `useState` to persist across refreshes + optional backend sync  
**Behavior:** Saves to localStorage instantly, backend after debounce  

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

function CourseColorPicker() {
  // Before: const [courseColors, setCourseColors] = useState({});
  
  // After: Same API as useState, but persists!
  const [courseColors, setCourseColors] = usePersistentState(
    'course_colors',              // localStorage key
    {},                           // Default value
    async (colors) => {           // Optional: sync to backend
      await fetch('/api/preferences/colors', {
        method: 'POST',
        body: JSON.stringify(colors)
      });
    },
    { debounceMs: 500 }          // Wait 500ms before backend save
  );
  
  // Use exactly like useState
  const updateColor = (courseId: string, color: string) => {
    setCourseColors(prev => ({ ...prev, [courseId]: color }));
    // ✨ Auto-saved to localStorage + backend!
  };
  
  return <div>...</div>;
}
```

**Real examples in our project:**
- Course color preferences
- Sidebar collapsed/expanded state
- Custom events (before backend is ready)
- User preferences

---

## 🚀 Step-by-Step: Migrating Existing Code

### Example: Custom Events Context

**BEFORE (No persistence):**
```tsx
// ❌ Data lost on refresh
const CustomEventsContext = createContext();

export function CustomEventsProvider({ children }) {
  const [customEvents, setCustomEvents] = useState([]);
  
  const addEvent = (event) => {
    setCustomEvents([...customEvents, event]);
  };
  
  return (
    <CustomEventsContext.Provider value={{ customEvents, addEvent }}>
      {children}
    </CustomEventsContext.Provider>
  );
}
```

**AFTER (With persistence):**
```tsx
// ✅ Data persists across refreshes + syncs to backend when ready
import { usePersistentState } from '~/hooks/usePersistentState';

const CustomEventsContext = createContext();

export function CustomEventsProvider({ children }) {
  // Just replace useState with usePersistentState
  const [customEvents, setCustomEvents] = usePersistentState(
    'custom_events',              // Will be saved as 'sap_custom_events'
    [],                           // Default value
    async (events) => {           // Backend sync (when /events endpoint ready)
      if (events.length > 0) {
        await fetch('/api/events', {
          method: 'POST',
          body: JSON.stringify({ events })
        });
      }
    },
    { debounceMs: 1000 }
  );
  
  const addEvent = (event) => {
    setCustomEvents([...customEvents, event]);
    // Everything else stays the same!
  };
  
  return (
    <CustomEventsContext.Provider value={{ customEvents, addEvent }}>
      {children}
    </CustomEventsContext.Provider>
  );
}
```

**Changes required:**
1. Import `usePersistentState`
2. Replace `useState(initialValue)` with `usePersistentState(key, initialValue, saveFunction)`
3. Done! ✨

---

## 🎨 Adding Visual Feedback

The sync indicator appears automatically in the bottom-right corner. You can also add inline feedback:

```tsx
import { usePersistence } from '~/context/PersistenceContext';

function MyComponent() {
  const { isOnline, isSyncing, queuedCount } = usePersistence();
  
  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-50 p-2 rounded mb-4">
          ☁️ You're offline. Changes will sync when you're back online.
          {queuedCount > 0 && ` (${queuedCount} pending)`}
        </div>
      )}
      
      {isSyncing && (
        <div className="text-blue-600">
          🔄 Syncing {queuedCount} changes...
        </div>
      )}
    </div>
  );
}
```

---

## 📋 Cheat Sheet

| Use Case | Hook | When It Saves |
|----------|------|---------------|
| Text input, forms | `useAutoSave` | After 1s of no typing |
| Buttons, checkboxes | `useImmediateSave` | Immediately on click |
| State that persists | `usePersistentState` | localStorage: instant<br>Backend: after debounce |

---

## 🔌 Backend Integration (When Your Endpoint is Ready)

### Step 1: Verify Backend Endpoint Works

```powershell
# Test your endpoint
curl http://localhost:8080/api/events
```

### Step 2: Use Correct Endpoint Format

**CRITICAL:** Endpoints should **NOT** include `/api` prefix:

```tsx
// ✅ CORRECT
const response = await fetch('/api/events', ...);  // Frontend code can use /api
// But for queue/services:
endpoint: '/events'   // → becomes http://localhost:8080/api/events

// ❌ WRONG
endpoint: '/api/events'   // → becomes http://localhost:8080/api/api/events (404!)
```

### Step 3: Test Offline → Online Flow

1. Open DevTools → Network tab → Go offline
2. Make a change (it gets queued)
3. Go online
4. Watch Network tab - should see your POST/PATCH request succeed
5. Check database - data should be there

---

## 🐛 Common Mistakes & Solutions

### ❌ Mistake 1: Using `/api` prefix in endpoints

```tsx
// ❌ WRONG
await fetch('/api/api/users', ...);  // Doubled /api !

// ✅ CORRECT  
await fetch('/api/users', ...);
```

### ❌ Mistake 2: Forgetting async/await

```tsx
// ❌ WRONG
useAutoSave(data, (data) => {
  fetch('/api/events', { body: JSON.stringify(data) });
});

// ✅ CORRECT
useAutoSave(data, async (data) => {
  await fetch('/api/events', {
    method: 'POST',
    body: JSON.stringify(data)
  });
});
```

### ❌ Mistake 3: Not handling errors

```tsx
// ❌ WRONG
const { isSaving } = useAutoSave(data, saveFunction);

// ✅ CORRECT
const { isSaving, error } = useAutoSave(data, saveFunction);

return (
  <div>
    {error && <span className="text-red-600">Error: {error}</span>}
  </div>
);
```

---

## ✅ Checklist For Your Story Card

Before marking your story as "Done":

- [ ] **Tested online** - Changes save to backend successfully
- [ ] **Tested offline** - Work continues without errors
- [ ] **Tested reconnect** - Queued changes sync automatically
- [ ] **Tested refresh** - Data persists across page refresh (localStorage)
- [ ] **Added loading state** - User sees "Saving..." or spinner
- [ ] **Added error handling** - User sees error messages if save fails
- [ ] **Used correct endpoint format** - No `/api/api/` doubled paths
- [ ] **Checked Network tab** - Requests show 200 OK responses
- [ ] **Checked Console** - No errors in browser console

---

## 📖 Real Project Examples

### 1. Custom Events (Already Migrated)

**File:** `frontend/app/context/CustomEventsContext.tsx`

```tsx
const [customEvents, setCustomEvents] = usePersistentState(
  'custom_events',
  generateInitialEvents(),
  async (events) => {
    if (events.length > 0) {
      await eventService.createBatch(events);
    }
  },
  { debounceMs: 1000 }
);
```

**What it does:**
- Stores events locally immediately
- Syncs to backend 1 second after changes stop
- Works offline, syncs when reconnected

### 2. Event Descriptions (Already Migrated)

**File:** `frontend/app/context/EventDescriptionsContext.tsx`

```tsx
const [descriptions, setDescriptions] = usePersistentState(
  'event_descriptions',
  {},
  async (data) => {
    const events = Object.entries(data).map(([id, desc]) => ({
      id,
      description: desc
    }));
    await eventService.updateDescriptionsBatch(events);
  },
  { debounceMs: 1000 }
);
```

**What it does:**
- Auto-saves descriptions as user types
- Batches multiple description updates
- No "Save" button needed

### 3. Completed Events (Already Migrated)

**File:** `frontend/app/context/CompletedEventsContext.tsx`

Uses immediate save pattern - checkboxes save instantly:

```tsx
const completeEvent = async (eventId: string) => {
  setCompletedEventIds(prev => new Set([...prev, eventId]));
  // Immediate sync to backend (no debounce)
  await eventService.markComplete(eventId);
};
```

---

## 🎓 Learn More

**Full Documentation:**
- [AUTO_SAVE_EXPLAINED.md](./AUTO_SAVE_EXPLAINED.md) - How the system works
- [INTEGRATION_GUIDE.md](../../frontend/app/utils/sync/INTEGRATION_GUIDE.md) - Detailed patterns
- [TESTING_AUTO_SAVE.md](./TESTING_AUTO_SAVE.md) - How to test your implementation

**Get Help:**
- Check Console for debug logs (look for 🌐, 🔄, ✅, ❌ emoji prefixes)
- Use DevTools Network tab to see actual requests
- Test with `/users` endpoint first (it's already working)

---

## 🎯 TL;DR - Copy/Paste Templates

### Template 1: Auto-saving Text Field

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

const [value, setValue] = useState('');
const { isSaving } = useAutoSave(value, async (data) => {
  await fetch('/api/your-endpoint', {
    method: 'POST',
    body: JSON.stringify({ data })
  });
});

return (
  <div>
    <input value={value} onChange={(e) => setValue(e.target.value)} />
    {isSaving && <span>💾 Saving...</span>}
  </div>
);
```

### Template 2: Immediate Save Button

```tsx
import { useImmediateSave } from '~/hooks/useAutoSave';

const { save, isSaving } = useImmediateSave(async (id) => {
  await fetch(`/api/your-endpoint/${id}`, { method: 'POST' });
});

return (
  <button onClick={() => save(itemId)} disabled={isSaving}>
    {isSaving ? 'Saving...' : 'Save'}
  </button>
);
```

### Template 3: Persistent State

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

const [data, setData] = usePersistentState(
  'my_data_key',
  initialValue,
  async (data) => await fetch('/api/save', { body: JSON.stringify(data) })
);

// Use exactly like useState
setData(newValue);
```

---

**Happy coding! 🚀 You've got auto-save superpowers now!** ✨

*Questions? Check the full [INTEGRATION_GUIDE.md](../../frontend/app/utils/sync/INTEGRATION_GUIDE.md) or ask the team.*
