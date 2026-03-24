# Persistence Cheat Sheet 📋

**Quick reference for auto-save, offline mode, and persistence**

---

## 🎯 Which Hook Should I Use?

| Your Use Case | Hook to Use | Saves When |
|---------------|-------------|------------|
| Text field (gradual input) | `useAutoSave` | 1s after typing stops |
| Button/checkbox (instant action) | `useImmediateSave` | Immediately on click |
| State that survives refresh | `usePersistentState` | localStorage: instant<br/>Backend: after delay |

---

## 📝 useAutoSave - Text Fields & Forms

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

const [text, setText] = useState('');
const { isSaving, error } = useAutoSave(
  text,                           // What to save
  async (data) => {               // How to save it
    await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ data })
    });
  },
  { debounceMs: 1000 }           // Wait time (default 500ms)
);

return (
  <>
    <input value={text} onChange={(e) => setText(e.target.value)} />
    {isSaving && <span>💾 Saving...</span>}
    {error && <span>❌ {error}</span>}
  </>
);
```

**Use for:** Event descriptions, notes, bio, any text input

---

## ⚡ useImmediateSave - Buttons & Immediate Actions

```tsx
import { useImmediateSave } from '~/hooks/useAutoSave';

const { save, isSaving } = useImmediateSave(
  async (id: string) => {
    await fetch(`/api/complete/${id}`, { method: 'POST' });
  }
);

return (
  <button onClick={() => save(taskId)} disabled={isSaving}>
    {isSaving ? '⏳ Saving...' : '✓ Complete'}
  </button>
);
```

**Use for:** Complete task, favorite, delete, RSVP, any button action

---

## 💾 usePersistentState - Drop-in useState Replacement

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

// Replace: useState(initialValue)
// With:    usePersistentState(key, initialValue, saveFunction)

const [colors, setColors] = usePersistentState(
  'course_colors',               // localStorage key
  {},                            // Initial value
  async (data) => {              // Optional backend sync
    await fetch('/api/colors', { body: JSON.stringify(data) });
  },
  { debounceMs: 500 }           // Optional delay
);

// Use exactly like useState
setColors({ CS101: '#blue' });  // Auto-saves!
```

**Use for:** Preferences, settings, any state that should persist

---

## 🌐 Show Offline Status

```tsx
import { usePersistence } from '~/context/PersistenceContext';

const { isOnline, isSyncing, queuedCount } = usePersistence();

return (
  <>
    {!isOnline && <div>☁️ Offline - {queuedCount} pending</div>}
    {isSyncing && <div>🔄 Syncing...</div>}
  </>
);
```

---

## ⚠️ Critical: Endpoint Format

```tsx
// ✅ CORRECT
endpoint: '/events'        // → http://localhost:8080/api/events

// ❌ WRONG (doubles /api)
endpoint: '/api/events'    // → http://localhost:8080/api/api/events
```

**Why:** `API_BASE_URL` already includes `/api`

---

## ✅ Testing Checklist

- [ ] Works online (saves to backend)
- [ ] Works offline (no errors)
- [ ] Syncs when reconnected
- [ ] Survives page refresh
- [ ] Shows "Saving..." indicator
- [ ] Shows errors if save fails
- [ ] No `/api/api/` doubled paths
- [ ] No console errors

---

## 🐛 Debug Commands (Browser Console)

```javascript
// Check online status
console.log('Online:', navigator.onLine);

// View queue
const queue = JSON.parse(localStorage.getItem('sap_persistence_queue') || '[]');
console.log('Queue:', queue);

// Check endpoints format
queue.forEach(item => console.log('Endpoint:', item.endpoint));
// Should see: /users, /events (NO /api prefix)

// Manual sync
import { startSync } from '~/utils/sync/syncEngine';
startSync().then(result => console.log(result));
```

---

## 📖 Examples in Project

**Custom Events:** `frontend/app/context/CustomEventsContext.tsx`  
**Event Descriptions:** `frontend/app/context/EventDescriptionsContext.tsx`  
**Completed Events:** `frontend/app/context/CompletedEventsContext.tsx`

---

## 🔗 Full Documentation

- [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) - Step-by-step guide
- [AUTO_SAVE_EXPLAINED.md](./AUTO_SAVE_EXPLAINED.md) - How it works
- [TESTING_AUTO_SAVE.md](./TESTING_AUTO_SAVE.md) - Testing guide

---

**Questions?** Check console logs (look for 🌐 🔄 ✅ ❌ emojis) or ask the team!
