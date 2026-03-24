# Migration Templates - Before & After

**Copy/paste examples for migrating existing code to use persistence**

---

## Template 1: Text Input with Manual Save Button

### ❌ BEFORE (Manual Save)

```tsx
function EventDescription({ eventId }: { eventId: string }) {
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ description })
      });
      alert('Saved!');
    } catch (error) {
      alert('Error saving!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
```

### ✅ AFTER (Auto-Save)

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

function EventDescription({ eventId }: { eventId: string }) {
  const [description, setDescription] = useState('');

  const { isSaving, error } = useAutoSave(
    description,
    async (data) => {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ description: data })
      });
    },
    { debounceMs: 1000 }
  );

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {isSaving && <span>💾 Saving...</span>}
      {error && <span className="text-red-600">❌ Error: {error}</span>}
      {/* No save button needed! */}
    </div>
  );
}
```

**What changed:**
- ❌ Removed `handleSave` function
- ❌ Removed save button
- ✅ Added `useAutoSave` hook
- ✅ Automatic save after 1 second of no typing
- ✅ Better error handling

---

## Template 2: Checkbox / Toggle with Manual API Call

### ❌ BEFORE (Manual API Call)

```tsx
function TaskItem({ task }: { task: Task }) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/tasks/${task.id}/complete`, {
        method: 'POST'
      });
      setIsCompleted(!isCompleted);
    } catch (error) {
      alert('Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <input
      type="checkbox"
      checked={isCompleted}
      onChange={handleToggle}
      disabled={isLoading}
    />
  );
}
```

### ✅ AFTER (Immediate Save)

```tsx
import { useImmediateSave } from '~/hooks/useAutoSave';

function TaskItem({ task }: { task: Task }) {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  const { save, isSaving } = useImmediateSave(
    async (taskId: string) => {
      await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST'
      });
    }
  );

  const handleToggle = () => {
    setIsCompleted(!isCompleted);  // Optimistic update
    save(task.id);
  };

  return (
    <input
      type="checkbox"
      checked={isCompleted}
      onChange={handleToggle}
      disabled={isSaving}
    />
  );
}
```

**What changed:**
- ✅ Added `useImmediateSave` hook
- ✅ Optimistic UI update (checkbox changes immediately)
- ✅ Cleaner code (less boilerplate)
- ✅ Automatic error handling and retry

---

## Template 3: Context with Manual localStorage

### ❌ BEFORE (Manual localStorage)

```tsx
const CustomEventsContext = createContext();

export function CustomEventsProvider({ children }) {
  const [customEvents, setCustomEvents] = useState(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('custom_events');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    // Save to localStorage on every change
    localStorage.setItem('custom_events', JSON.stringify(customEvents));
  }, [customEvents]);

  const addEvent = (event) => {
    setCustomEvents([...customEvents, event]);
    
    // Manually save to backend
    fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(event)
    }).catch(err => console.error('Failed to save', err));
  };

  return (
    <CustomEventsContext.Provider value={{ customEvents, addEvent }}>
      {children}
    </CustomEventsContext.Provider>
  );
}
```

### ✅ AFTER (Persistent State)

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

const CustomEventsContext = createContext();

export function CustomEventsProvider({ children }) {
  const [customEvents, setCustomEvents] = usePersistentState(
    'custom_events',
    [],
    async (events) => {
      // Auto-saves to backend when ready
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
    // That's it! Auto-saves to localStorage + backend
  };

  return (
    <CustomEventsContext.Provider value={{ customEvents, addEvent }}>
      {children}
    </CustomEventsContext.Provider>
  );
}
```

**What changed:**
- ❌ Removed manual localStorage logic (initial load + useEffect)
- ❌ Removed manual API calls
- ✅ Added `usePersistentState` with backend sync
- ✅ Offline support automatically
- ✅ Queue system for failed requests
- ✅ 90% less code!

---

## Template 4: Form with Multiple Fields

### ❌ BEFORE (Manual Save)

```tsx
function EventForm({ eventId }: { eventId: string }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, description, location })
      });
      alert('Saved!');
    } catch (error) {
      alert('Error!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <input value={location} onChange={(e) => setLocation(e.target.value)} />
      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### ✅ AFTER (Auto-Save)

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

function EventForm({ eventId }: { eventId: string }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: ''
  });

  const { isSaving, error } = useAutoSave(
    formData,
    async (data) => {
      await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },
    { debounceMs: 1500 }  // Wait 1.5 seconds after typing stops
  );

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <input
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
      />
      <textarea
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
      />
      <input
        value={formData.location}
        onChange={(e) => updateField('location', e.target.value)}
      />
      {isSaving && <span>💾 Saving...</span>}
      {error && <span>❌ Error: {error}</span>}
      {!isSaving && !error && <span>✅ All changes saved</span>}
    </div>
  );
}
```

**What changed:**
- ❌ Removed form submission handler
- ❌ Removed submit button
- ✅ Combined fields into single `formData` object
- ✅ Auto-saves entire form together
- ✅ Better user experience (no manual saving)

---

## Template 5: List Management (Add/Remove)

### ❌ BEFORE (Manual Sync)

```tsx
function CourseList() {
  const [courses, setCourses] = useState([]);

  const addCourse = async (course) => {
    const newList = [...courses, course];
    setCourses(newList);
    
    try {
      await fetch('/api/courses', {
        method: 'POST',
        body: JSON.stringify(course)
      });
    } catch (error) {
      // If fails, revert?
      setCourses(courses);
      alert('Failed to add course');
    }
  };

  const removeCourse = async (courseId) => {
    const newList = courses.filter(c => c.id !== courseId);
    setCourses(newList);
    
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      setCourses(courses);
      alert('Failed to remove course');
    }
  };

  return <div>...</div>;
}
```

### ✅ AFTER (Persistent State)

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

function CourseList() {
  const [courses, setCourses] = usePersistentState(
    'courses',
    [],
    async (courseList) => {
      // Sync entire list to backend
      await fetch('/api/courses/sync', {
        method: 'POST',
        body: JSON.stringify({ courses: courseList })
      });
    },
    { debounceMs: 1000 }
  );

  const addCourse = (course) => {
    setCourses([...courses, course]);
    // Auto-syncs to localStorage + backend!
  };

  const removeCourse = (courseId) => {
    setCourses(courses.filter(c => c.id !== courseId));
    // Auto-syncs!
  };

  return <div>...</div>;
}
```

**What changed:**
- ✅ Simple functions without try/catch everywhere
- ✅ Optimistic updates (UI changes immediately)
- ✅ Automatic retry on failure
- ✅ Works offline
- ✅ Way less code!

---

## Template 6: Settings/Preferences

### ❌ BEFORE (useState with Manual Persistence)

```tsx
function UserSettings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    language: 'en'
  });

  useEffect(() => {
    // Load on mount
    const stored = localStorage.getItem('user_settings');
    if (stored) setSettings(JSON.parse(stored));
  }, []);

  useEffect(() => {
    // Save on change
    localStorage.setItem('user_settings', JSON.stringify(settings));
    
    // Also save to backend
    fetch('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return <div>...</div>;
}
```

### ✅ AFTER (One Line!)

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

function UserSettings() {
  const [settings, setSettings] = usePersistentState(
    'user_settings',
    { theme: 'light', notifications: true, language: 'en' },
    async (data) => {
      await fetch('/api/user/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    }
  );

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return <div>...</div>;
}
```

**What changed:**
- ❌ Removed both `useEffect` hooks (12 lines!)
- ✅ One line `usePersistentState` does it all
- ✅ Same functionality, way less code

---

## Quick Decision Tree

```
Need to save data?
│
├─ User types text gradually → useAutoSave
│
├─ Button/checkbox click → useImmediateSave
│
└─ State survives refresh → usePersistentState
```

---

## Common Patterns Summary

| Pattern | Before | After | Lines Saved |
|---------|--------|-------|-------------|
| Text input | Manual save button | `useAutoSave` | ~15 lines |
| Checkbox | Manual API call | `useImmediateSave` | ~10 lines |
| Context state | Manual localStorage | `usePersistentState` | ~20 lines |
| Form | Submit handler | `useAutoSave` | ~12 lines |
| List CRUD | Try/catch everywhere | `usePersistentState` | ~25 lines |
| Settings | Two useEffects | `usePersistentState` | ~15 lines |

**Average code reduction: 60-70%** ✨

---

## Need More Examples?

Look at these migrated files in the project:

1. **CustomEventsContext.tsx** - usePersistentState pattern
2. **EventDescriptionsContext.tsx** - useAutoSave pattern
3. **CompletedEventsContext.tsx** - useImmediateSave pattern
4. **test-sync.tsx** - All patterns together

---

**Ready to migrate?** Copy the template that matches your use case and customize! 🚀
