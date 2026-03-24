# Persistence System Documentation

**Auto-save, offline mode, and data persistence for the Student Academic Planner**

---

## 📚 Choose Your Guide

### 🚀 [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) 
**Start here if you're implementing a feature**
- Step-by-step migration guide
- Real code examples from the project
- Copy/paste templates
- Common mistakes to avoid
- **Time: 10 minutes**

### 📋 [CHEAT_SHEET.md](./CHEAT_SHEET.md)
**Quick reference while coding**
- One-page summary of all three hooks
- Minimal examples
- Debug commands
- Testing checklist
- **Time: 2 minutes**

### 📊 [VISUAL_REFERENCE.md](./VISUAL_REFERENCE.md)
**Visual diagrams and decision trees**
- Which hook should I use? (flowchart)
- Feature comparison table
- Offline behavior diagrams
- Testing checklist
- **Time: 5 minutes**

### 🔬 [TESTING_AUTO_SAVE.md](./TESTING_AUTO_SAVE.md)
**Complete testing guide**
- 10 detailed test scenarios
- DevTools debugging techniques
- Troubleshooting common issues
- Performance testing
- **Time: 30 minutes**

### 🎓 [AUTO_SAVE_EXPLAINED.md](./AUTO_SAVE_EXPLAINED.md)
**Deep dive into how it works**
- Architecture overview
- Component interactions
- Technical implementation details
- For understanding the internals
- **Time: 20 minutes**

### 🔌 [INTEGRATION_GUIDE.md](../../frontend/app/utils/sync/INTEGRATION_GUIDE.md)
**Comprehensive integration patterns**
- Advanced use cases
- Custom configurations
- Edge case handling
- Full API reference
- **Time: 45 minutes**

---

## ⚡ Quick Start (30 seconds)

### I want to add auto-save to a text field:

```tsx
import { useAutoSave } from '~/hooks/useAutoSave';

const [text, setText] = useState('');
const { isSaving } = useAutoSave(text, async (data) => {
  await fetch('/api/save', { body: JSON.stringify({ data }) });
});
```

### I want to save when a button is clicked:

```tsx
import { useImmediateSave } from '~/hooks/useAutoSave';

const { save, isSaving } = useImmediateSave(async (id) => {
  await fetch(`/api/complete/${id}`, { method: 'POST' });
});
```

### I want state that survives page refresh:

```tsx
import { usePersistentState } from '~/hooks/usePersistentState';

const [data, setData] = usePersistentState('my_key', initialValue);
// Use exactly like useState - auto-saves to localStorage!
```

---

## 🎯 What Problem Does This Solve?

### Before (Manual Saves)
❌ User needs to click "Save" button  
❌ Lose data if browser crashes  
❌ App breaks when offline  
❌ No feedback during saves  

### After (Persistence System)
✅ Saves automatically as user types  
✅ Data persists across refreshes  
✅ Works offline, syncs when reconnected  
✅ Visual feedback ("Saving...", "Saved")  

---

## 📦 What's Included

### Three React Hooks

| Hook | Use Case | Example |
|------|----------|---------|
| `useAutoSave` | Text input, gradual changes | Event descriptions, notes |
| `useImmediateSave` | Buttons, instant actions | Complete task, delete |
| `usePersistentState` | State that persists | Preferences, colors |

### Three React Contexts

| Context | Purpose | Access Via |
|---------|---------|------------|
| `NetworkContext` | Online/offline detection | `useNetwork()` |
| `SyncContext` | Queue management | `useSync()` |
| `PersistenceContext` | Combined functionality | `usePersistence()` |

### Visual Sync Indicator

Appears in bottom-right corner:
- 🔄 **Syncing...** - Saving changes
- ✅ **Saved** - Changes saved successfully
- ☁️ **Offline** - Working without internet
- ⏱️ **3 pending** - Queued changes waiting to sync
- ❌ **Sync failed** - Error occurred

---

## 🎓 Already Migrated Examples

Learn by looking at existing code:

### 1. Custom Events Context
**File:** `frontend/app/context/CustomEventsContext.tsx`  
**Pattern:** usePersistentState with backend sync  
**What to learn:** How to replace useState with persistent version

### 2. Event Descriptions Context  
**File:** `frontend/app/context/EventDescriptionsContext.tsx`  
**Pattern:** useAutoSave with debouncing  
**What to learn:** Auto-saving text as user types

### 3. Completed Events Context
**File:** `frontend/app/context/CompletedEventsContext.tsx`  
**Pattern:** useImmediateSave with optimistic UI  
**What to learn:** Instant saves for button clicks

### 4. Test Sync Page
**File:** `frontend/app/routes/test-sync.tsx`  
**Pattern:** All hooks + manual testing  
**What to learn:** How to test persistence features  
**Visit:** http://localhost:5173/test-sync

---

## ✅ Implementation Checklist

Before starting your feature:

- [ ] Read [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md)
- [ ] Keep [CHEAT_SHEET.md](./CHEAT_SHEET.md) open while coding
- [ ] Look at existing examples in `context/` folder
- [ ] Understand which hook to use (see [VISUAL_REFERENCE.md](./VISUAL_REFERENCE.md))

While implementing:

- [ ] Use correct endpoint format (no `/api` prefix)
- [ ] Add `async/await` to save functions
- [ ] Show loading state (`isSaving`)
- [ ] Handle errors (`error` state)
- [ ] Test online mode first
- [ ] Then test offline mode
- [ ] Test reconnection sync

Before marking done:

- [ ] Follow checklist in [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md)
- [ ] Run tests from [TESTING_AUTO_SAVE.md](./TESTING_AUTO_SAVE.md)
- [ ] Verify in Network tab (no 404s)
- [ ] Check Console (no errors)
- [ ] Test page refresh (data persists)

---

## 🐛 Troubleshooting

### Common Issues

| Problem | Quick Fix | Details |
|---------|-----------|---------|
| 404 errors with `/api/api/` | Use `/events` not `/api/events` | [CHEAT_SHEET.md](./CHEAT_SHEET.md) |
| Queue not processing | Check wasOffline logic | [TESTING_AUTO_SAVE.md](./TESTING_AUTO_SAVE.md) |
| Data lost on refresh | Use usePersistentState | [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) |
| No loading indicator | Use `isSaving` state | [CHEAT_SHEET.md](./CHEAT_SHEET.md) |

### Debug Commands

Open browser console and run:

```javascript
// Check online status
navigator.onLine

// View queue
JSON.parse(localStorage.getItem('sap_persistence_queue') || '[]')

// Manual sync (when imports work in console)
import('/app/utils/sync/syncEngine.js').then(m => m.startSync())
```

---

## 🎯 Success Stories

### Custom Events Feature
**Before:** Custom events lost on page refresh  
**After:** Events persist, work offline, sync when online  
**Implementation time:** 30 minutes  
**Lines changed:** 10 lines

### Event Descriptions
**Before:** Manual save button, lost work if browser crashed  
**After:** Auto-saves while typing, never lose work  
**Implementation time:** 20 minutes  
**Lines changed:** 15 lines

---

## 📞 Get Help

1. **Check the docs** - Start with [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md)
2. **Look at examples** - See `context/` folder for working code
3. **Test page** - Visit http://localhost:5173/test-sync
4. **Console logs** - Look for emoji prefixes (🌐 🔄 ✅ ❌)
5. **Network tab** - Verify actual request URLs
6. **Ask the team** - We've all been through this!

---

## 🚀 Ready to Start?

1. **Read:** [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) (10 minutes)
2. **Print:** [CHEAT_SHEET.md](./CHEAT_SHEET.md) (keep next to your monitor)
3. **Code:** Copy/paste templates from quick start guide
4. **Test:** Follow [TESTING_AUTO_SAVE.md](./TESTING_AUTO_SAVE.md) checklist
5. **Ship:** 🎉

---

**Questions?** Start with the [DEVELOPER_QUICK_START.md](./DEVELOPER_QUICK_START.md) - it answers 95% of questions!

**Last Updated:** February 2026  
**System Status:** ✅ Production Ready  
**Migrated Features:** Custom Events, Event Descriptions, Completed Events  
**Test Page:** http://localhost:5173/test-sync
