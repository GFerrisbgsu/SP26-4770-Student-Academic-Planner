# React Fundamentals for Beginners

Welcome to the Smart Academic Calendar project! This guide will help you understand React and how it's used throughout this codebase. If you just learned the difference between `.ts` and `.tsx` files, you're in the right place.

---

## 📁 What's the Difference Between `.ts` and `.tsx`?

| File Extension | Purpose |
|----------------|---------|
| `.ts` | Pure TypeScript files - logic, utilities, types, and data |
| `.tsx` | TypeScript files that contain **JSX** (HTML-like code) - React components |

### Example from this project:

```
app/
├── data/courses.ts          # .ts - Just data and TypeScript types
├── utils/generateEvents.ts  # .ts - Utility functions, no visual components
├── components/Calendar.tsx  # .tsx - React component with UI (JSX)
└── routes/home.tsx          # .tsx - Page component with UI (JSX)
```

**Rule of thumb**: If the file renders anything visual (buttons, text, layouts), it needs to be `.tsx`.

---

## 🧩 What is JSX?

JSX is a syntax extension that lets you write HTML-like code inside JavaScript/TypeScript. React components return JSX to describe what the UI should look like.

### Example from [Calendar.tsx](../app/components/Calendar.tsx):

```tsx
// This is JSX - looks like HTML but it's actually JavaScript!
return (
  <div className="flex-1 p-8">
    <h1 className="text-2xl font-semibold">
      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
    </h1>
    <button onClick={previousMonth}>
      Previous
    </button>
  </div>
);
```

**Key differences from HTML:**
- `class` → `className` (because `class` is reserved in JavaScript)
- `onclick` → `onClick` (camelCase for event handlers)
- `{expression}` - Curly braces let you embed JavaScript expressions

---

## 🏗️ What is a React Component?

A **component** is a reusable piece of UI. Think of it like a LEGO brick - you build your app by combining smaller components.

### There are two main ways to write components:

#### 1. Function Components (what this project uses)

```tsx
// From app/components/Calendar.tsx
export function Calendar({ leftCollapsed, rightCollapsed, courseColors }: CalendarProps) {
  // Component logic here...
  
  return (
    <div className="flex-1 p-8">
      {/* JSX (UI) here */}
    </div>
  );
}
```

#### 2. Arrow Function Components (also common)

```tsx
const Calendar = ({ leftCollapsed, rightCollapsed }: CalendarProps) => {
  return (
    <div className="flex-1 p-8">
      {/* JSX here */}
    </div>
  );
};
```

Both work the same way - this project prefers regular function syntax.

---

## 📥 Props: How Components Talk to Each Other

**Props** (short for "properties") are how you pass data from a parent component to a child component.

### Example from this project:

```tsx
// Parent component (CalendarView.tsx) passes props to child (Calendar)
<Calendar 
  leftCollapsed={leftCollapsed}      // boolean
  rightCollapsed={rightCollapsed}    // boolean
  courseColors={courseColors}        // object
/>
```

```tsx
// Child component (Calendar.tsx) receives and uses props
interface CalendarProps {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  courseColors: Record<string, string>;
}

export function Calendar({ leftCollapsed, rightCollapsed, courseColors }: CalendarProps) {
  // Now you can use leftCollapsed, rightCollapsed, courseColors inside this component!
}
```

**The `interface` keyword** defines the "shape" of the props - what data types the component expects. TypeScript will warn you if you pass the wrong type!

---

## 🔄 State: Making Components Interactive

**State** is data that can change over time. When state changes, React automatically re-renders the component to show the new data.

### The `useState` Hook

```tsx
// From app/components/Calendar.tsx
import { useState } from 'react';

export function Calendar() {
  // Declare a state variable called 'currentDate'
  // setCurrentDate is the function to update it
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  
  const nextMonth = () => {
    // This updates the state, which triggers a re-render
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  return (
    <button onClick={nextMonth}>Next Month</button>
  );
}
```

**Pattern**: `const [value, setValue] = useState(initialValue);`

| Part | Purpose |
|------|---------|
| `value` | The current state value |
| `setValue` | Function to update the state |
| `initialValue` | What the state starts as |

---

## 🎣 Hooks: Special React Functions

**Hooks** are special functions that let you "hook into" React features. They always start with `use`.

### Hooks used in this project:

| Hook | Purpose | Example |
|------|---------|---------|
| `useState` | Store and update data | `const [date, setDate] = useState(new Date())` |
| `useEffect` | Run code when something changes | Side effects, data fetching |
| `useContext` | Share data across components | See Context section below |
| `useCallback` | Memoize functions for performance | Prevent unnecessary re-renders |
| `useParams` | Get URL parameters (from React Router) | `/timeline/:date` → `{ date: "2026-1-15" }` |
| `useNavigate` | Navigate programmatically | `navigate('/course-list')` |
| `useSearchParams` | Read/write URL query params | `?month=0&year=2026` |

### Example of `useEffect`:

```tsx
// From app/components/Calendar.tsx
useEffect(() => {
  // This code runs whenever urlMonth or urlYear changes
  if (urlMonth && urlYear) {
    setCurrentDate(new Date(parseInt(urlYear), parseInt(urlMonth), 1));
  }
}, [urlMonth, urlYear]); // <-- Dependency array: when these change, run the effect
```

---

## 🌐 Context: Sharing State Across the App

Sometimes many components need access to the same data. Instead of passing props through every component, we use **Context**.

### How Context works in this project:

#### 1. Create the Context ([CompletedEventsContext.tsx](../app/context/CompletedEventsContext.tsx)):

```tsx
// Create a context with a default value
const CompletedEventsContext = createContext<CompletedEventsContextType | undefined>(undefined);

// Create a Provider component that wraps other components
export function CompletedEventsProvider({ children }: { children: ReactNode }) {
  const [completedEventIds, setCompletedEventIds] = useState<Set<string>>(() => new Set());
  
  return (
    <CompletedEventsContext.Provider value={{ completedEventIds, completeEvent, uncompleteEvent }}>
      {children}
    </CompletedEventsContext.Provider>
  );
}

// Create a custom hook to easily use the context
export function useCompletedEvents() {
  const context = useContext(CompletedEventsContext);
  if (context === undefined) {
    throw new Error('useCompletedEvents must be used within a CompletedEventsProvider');
  }
  return context;
}
```

#### 2. Wrap your app with the Provider ([root.tsx](../app/root.tsx)):

```tsx
<CompletedEventsProvider>
  <EventDescriptionsProvider>
    {children}  {/* All components inside can access this context */}
  </EventDescriptionsProvider>
</CompletedEventsProvider>
```

#### 3. Use the context in any component:

```tsx
// From Calendar.tsx
import { useCompletedEvents } from '~/context/CompletedEventsContext';

export function Calendar() {
  const { completedEventIds, completeEvent } = useCompletedEvents();
  
  // Now you can check if an event is completed anywhere in the app!
  const isCompleted = completedEventIds.has(event.id);
}
```

---

## 📂 Project Structure Overview

```
app/
├── root.tsx              # The root layout - wraps everything with providers
├── routes.ts             # Defines URL routes
├── app.css               # Global styles
│
├── routes/               # Each file = a page
│   ├── home.tsx          # "/" - Main calendar page
│   ├── course.tsx        # "/course/:courseId" - Course details
│   ├── timeline.tsx      # "/timeline/:date" - Daily view
│   └── ...
│
├── components/           # Reusable UI pieces
│   ├── Calendar.tsx      # The main calendar grid
│   ├── Sidebar.tsx       # Course list sidebar
│   ├── ToDoSidebar.tsx   # To-do list sidebar
│   └── ...
│
├── context/              # Global state using Context
│   ├── CompletedEventsContext.tsx
│   ├── CustomEventsContext.tsx
│   └── ...
│
├── data/                 # Static data and types
│   └── courses.ts
│
└── utils/                # Helper functions
    └── generateEvents.ts
```

---

## 🎯 Key Patterns in This Project

### 1. Component Composition

Big components are made of smaller components:

```tsx
// CalendarView.tsx composes multiple components together
<div className="flex h-screen">
  <Sidebar />           {/* Left sidebar component */}
  <Calendar />          {/* Main calendar component */}
  <ToDoSidebar />       {/* Right sidebar component */}
</div>
```

### 2. Conditional Rendering

Show different things based on conditions:

```tsx
// Show "completed" style if event is completed
<div className={isCompleted ? 'bg-gray-100 opacity-60' : event.color}>
  {event.title}
</div>

// Only show warning icon if there are conflicts
{conflictingEventIds.size > 0 && (
  <AlertTriangle className="w-3 h-3 text-red-500" />
)}
```

### 3. Lists and Keys

Render lists of items:

```tsx
// Map over an array to create multiple elements
{events.map(event => (
  <div key={event.id}>  {/* key helps React track which items changed */}
    {event.title}
  </div>
))}
```

---

## 📚 Next Steps

Now that you understand the React basics, continue to:

1. **[02-VITE-AND-BUILD-TOOLS.md](./02-VITE-AND-BUILD-TOOLS.md)** - Learn about Vite and how the project builds
2. **[03-REACT-ROUTER-GUIDE.md](./03-REACT-ROUTER-GUIDE.md)** - Understand routing and navigation
3. **[04-CALENDAR-PROJECT-FILES.md](./04-CALENDAR-PROJECT-FILES.md)** - Deep dive into this specific project's files
