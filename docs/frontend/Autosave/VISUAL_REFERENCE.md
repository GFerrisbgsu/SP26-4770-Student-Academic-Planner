# Persistence System - Visual Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISION TREE: Which Hook?                   │
└─────────────────────────────────────────────────────────────────┘

                    What are you building?
                            │
              ┌─────────────┼─────────────┐
              │             │             │
          Text Input    Button/Action   State that
           Textarea      Checkbox        Persists
              │             │             │
              ▼             ▼             ▼
        useAutoSave   useImmediateSave  usePersistentState
              │             │             │
        ┌─────┴─────┐       │       ┌─────┴─────┐
        │           │       │       │           │
    Saves after   Shows    Saves   Replaces    Backend
    debounce      loading  instantly useState   Sync
    (1 second)    state              │          Optional
                                     │
                        ┌────────────┴────────────┐
                        │                         │
                   localStorage                Backend
                    (instant)              (after delay)


┌─────────────────────────────────────────────────────────────────┐
│                     HOOK COMPARISON TABLE                       │
└─────────────────────────────────────────────────────────────────┘

Feature              │ useAutoSave  │ useImmediateSave │ usePersistentState
─────────────────────┼──────────────┼──────────────────┼───────────────────
Saves to backend     │      ✅      │        ✅        │   ✅ (optional)
Saves to localStorage│      ❌      │        ❌        │        ✅
Debounce delay       │      ✅      │        ❌        │   ✅ (backend only)
Loading state        │      ✅      │        ✅        │        ✅
Error handling       │      ✅      │        ✅        │        ✅
Survives refresh     │      ❌      │        ❌        │        ✅
Use with forms       │      ✅      │        ❌        │        ✅
Use with buttons     │      ❌      │        ✅        │        ❌
Replace useState     │      ❌      │        ❌        │        ✅


┌─────────────────────────────────────────────────────────────────┐
│                      CODE COMPARISON                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ useAutoSave - Gradual Input                                     │
└─────────────────────────────────────────────────────────────────┘

const [text, setText] = useState('');
const { isSaving } = useAutoSave(text, async (data) => {
  await api.save(data);
});

<input value={text} onChange={(e) => setText(e.target.value)} />
{isSaving && <span>Saving...</span>}

📊 Flow: Type ──▶ Wait 1s ──▶ Save ──▶ Show "Saved"


┌─────────────────────────────────────────────────────────────────┐
│ useImmediateSave - Instant Actions                              │
└─────────────────────────────────────────────────────────────────┘

const { save, isSaving } = useImmediateSave(async (id) => {
  await api.complete(id);
});

<button onClick={() => save(taskId)} disabled={isSaving}>
  {isSaving ? 'Saving...' : 'Complete'}
</button>

📊 Flow: Click ──▶ Save Immediately ──▶ Show "Completed"


┌─────────────────────────────────────────────────────────────────┐
│ usePersistentState - Persistent State                           │
└─────────────────────────────────────────────────────────────────┘

const [data, setData] = usePersistentState(
  'my_key',
  initialValue,
  async (d) => await api.save(d)  // Optional
);

setData(newValue);  // Auto-saves to localStorage + backend!

📊 Flow: Update ──▶ localStorage (instant) ──▶ Backend (after delay)


┌─────────────────────────────────────────────────────────────────┐
│                    REAL WORLD EXAMPLES                          │
└─────────────────────────────────────────────────────────────────┘

USE CASE                          │ HOOK TO USE          │ WHY
──────────────────────────────────┼──────────────────────┼──────────────────
Event description field           │ useAutoSave          │ User types gradually
Budget amount input               │ useAutoSave          │ Wait for final value
Complete task checkbox            │ useImmediateSave     │ Instant feedback
Delete event button               │ useImmediateSave     │ Immediate action
Course color picker               │ usePersistentState   │ Survives refresh
Sidebar collapsed state           │ usePersistentState   │ UI preference
Custom events list                │ usePersistentState   │ Offline-first data
User profile settings             │ usePersistentState   │ Persist + sync


┌─────────────────────────────────────────────────────────────────┐
│                    OFFLINE MODE BEHAVIOR                        │
└─────────────────────────────────────────────────────────────────┘

                          ONLINE
                            │
                    ┌───────┴───────┐
                    │               │
              useAutoSave    usePersistentState
                    │               │
             Saves to API    localStorage + API
                    │               │
                    ▼               ▼
                [ Backend ]   [ Browser + Backend ]
                    
                          OFFLINE
                            │
                    ┌───────┴───────┐
                    │               │
              useAutoSave    usePersistentState
                    │               │
              Queued for sync  localStorage only
                    │               │
                    ▼               ▼
            [ Request Queue ]  [ Browser Storage ]
                    │
              [Back Online]
                    │
                    ▼
            Auto-syncs to backend ✅


┌─────────────────────────────────────────────────────────────────┐
│              COMMON PATTERNS & ANTI-PATTERNS                    │
└─────────────────────────────────────────────────────────────────┘

✅ DO THIS                         │ ❌ DON'T DO THIS
───────────────────────────────────┼────────────────────────────────
useAutoSave for text fields        │ useImmediateSave for text input
useImmediateSave for buttons       │ useAutoSave for checkboxes
usePersistentState instead         │ Manual localStorage calls
  of useState when data persists   │
Use async/await in save function   │ Forget await (silent failures)
Endpoint: '/events'                │ Endpoint: '/api/events' (404!)
Show {isSaving && "Saving..."}     │ No loading feedback
Handle errors: {error && ...}      │ Ignore error state


┌─────────────────────────────────────────────────────────────────┐
│                    DEBUGGING FLOWCHART                          │
└─────────────────────────────────────────────────────────────────┘

                    Save not working?
                            │
              ┌─────────────┼─────────────┐
              │                           │
        Check Console               Check Network
              │                           │
              ▼                           ▼
    Look for emoji logs          See actual requests
    🌐 🔄 ✅ ❌                    │
              │                           │
              │                    ┌──────┴──────┐
              │                    │             │
              │               200 OK?       404/500?
              │                    │             │
              │                    ▼             ▼
              │              Working!      Wrong endpoint
              │                           or Backend error
              │
              ▼
    ┌─────────┴─────────┐
    │                   │
  Errors?          No logs?
    │                   │
    ▼                   ▼
Check error      Check hook
handling         initialized


┌─────────────────────────────────────────────────────────────────┐
│                   TESTING CHECKLIST                             │
└─────────────────────────────────────────────────────────────────┘

Test Scenario                              │ Expected Behavior
───────────────────────────────────────────┼──────────────────────────
1. Type in field                           │ Shows "Saving..." after 1s
2. Click save button                       │ Saves immediately
3. Go offline (DevTools)                   │ Shows "☁️ Offline"
4. Make change while offline               │ No errors, queued
5. Go back online                          │ Auto-syncs, queue clears
6. Refresh page                            │ Data still there (persistent)
7. Check Network tab                       │ Correct endpoint URLs
8. Force error (stop backend)              │ Shows error message
9. Check localStorage                      │ Keys start with 'sap_'
10. Check queue format                     │ Endpoints WITHOUT /api

✅ All passing? You're good to deploy! 🚀


┌─────────────────────────────────────────────────────────────────┐
│                     QUICK DEBUG COMMANDS                        │
└─────────────────────────────────────────────────────────────────┘

// Browser console commands (copy/paste):

// Check online/offline
navigator.onLine

// View queue
JSON.parse(localStorage.getItem('sap_persistence_queue') || '[]')

// Check endpoint format
JSON.parse(localStorage.getItem('sap_persistence_queue') || '[]')
  .forEach(item => console.log(item.endpoint))

// Manual sync
import('/app/utils/sync/syncEngine.js')
  .then(m => m.startSync())
  .then(r => console.log(r))

// Clear queue (emergency)
localStorage.removeItem('sap_persistence_queue')


┌─────────────────────────────────────────────────────────────────┐
│                      GET HELP                                   │
└─────────────────────────────────────────────────────────────────┘

📚 Documentation:
  • DEVELOPER_QUICK_START.md - Step-by-step guide
  • CHEAT_SHEET.md - Quick reference
  • AUTO_SAVE_EXPLAINED.md - Deep dive

🔍 Debugging:
  • Console logs (look for emoji prefixes)
  • Network tab (check request URLs)
  • localStorage inspector

💬 Ask the Team:
  • Check existing implementations in context/ folder
  • CustomEventsContext.tsx - Complete example
  • Test page: http://localhost:5173/test-sync
