---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Copilot Instructions - Student Academic Planner Frontend

## Project Overview
A React-based student academic planner with calendar, course management, and degree tracking. Built with **React Router v7** (file-based routing with SSR), **Vite**, **TypeScript**, and **Tailwind CSS v4**.

## Technology Stack

### Core Technologies
- **React 19** - UI library with hooks and functional components
- **TypeScript** - Type-safe JavaScript
- **React Router v7** - File-based routing with SSR capabilities
- **Vite** - Fast build tool and dev server with Hot Module Replacement (HMR)
- **Tailwind CSS v4** - Utility-first CSS framework

### UI Libraries
- **shadcn/ui** - Radix UI primitives with Tailwind styling
- **Lucide React** - Icon library
- **CVA (Class Variance Authority)** - Component variant management

## Architecture

### File Structure
```
app/
├── root.tsx              # Root layout - wraps everything with providers
├── routes.ts             # Route definitions
├── app.css               # Global Tailwind styles
│
├── routes/               # Page components (file-based routing)
│   ├── home.tsx          # "/" - Main calendar page
│   ├── course.tsx        # "/course/:courseId" - Course details
│   ├── timeline.tsx      # "/timeline/:date" - Daily view
│   ├── event.tsx         # "/event/:eventId" - Event details
│   ├── course-list.tsx   # "/course-list" - Course catalog
│   ├── profile.tsx       # "/profile" - User profile
│   └── degree-progress.tsx # "/degree-progress" - Degree tracking
│
├── components/           # Reusable UI components
│   ├── Calendar.tsx      # Main calendar grid component
│   ├── CalendarView.tsx  # Calendar page layout wrapper
│   ├── Sidebar.tsx       # Course list sidebar
│   ├── ToDoSidebar.tsx   # To-do list sidebar
│   ├── Navbar.tsx        # Top navigation bar
│   ├── AddEventModal.tsx # Custom event creation modal
│   └── ui/               # shadcn/ui primitives (button, dialog, etc.)
│
├── context/              # React Context for global state
│   ├── CompletedEventsContext.tsx    # Track completed events
│   ├── CustomEventsContext.tsx       # Custom event management
│   ├── EventDescriptionsContext.tsx  # Event descriptions
│   └── WhatIfModeContext.tsx         # "What-if" planning mode
│
├── data/                 # Static data and course information
│   ├── courses.ts                    # Course exports
│   ├── bscsCoursesData.ts           # BSCS course catalog
│   └── programsAndPrerequisites.ts  # Degree requirements
│
├── utils/                # Helper functions and utilities
│   ├── generateEvents.ts # Generate calendar events from courses
│   ├── tagUtils.ts       # Event tagging system
│   └── ...
│
└── types/                # TypeScript type definitions
```

### Layer Responsibilities

**Routes** (`app/routes/`)
- Each file represents a page accessible via URL
- Export default component (the page UI)
- Export optional `meta()` function for page title and meta tags
- Export optional `loader()` for data fetching
- Export optional `action()` for form submissions

**Components** (`app/components/`)
- Reusable UI pieces used across pages
- Follow composition pattern (small components combine into larger ones)
- Use TypeScript interfaces for props
- Keep components focused on presentation

**Context** (`app/context/`)
- Global state shared across the entire app
- Provider wraps app in `root.tsx`
- Custom hooks for consuming context (e.g., `useCompletedEvents()`)
- Avoid prop drilling by using context for widely-used data

**Utils** (`app/utils/`)
- Pure functions with no side effects
- Reusable logic extracted from components
- Type-safe helper functions

## React Fundamentals

### File Extensions

| Extension | Purpose |
|-----------|---------|
| `.ts` | Pure TypeScript - logic, utilities, types, data |
| `.tsx` | TypeScript with JSX - React components with UI |

**Rule**: If a file renders UI (JSX), it must be `.tsx`.

### JSX (JavaScript XML)

JSX lets you write HTML-like syntax in JavaScript:

```tsx
// JSX example from Calendar.tsx
return (
  <div className="flex-1 p-8">
    <h1 className="text-2xl font-semibold">
      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
    </h1>
    <button onClick={previousMonth}>Previous</button>
  </div>
);
```

**Key differences from HTML:**
- `class` → `className` (because `class` is reserved in JavaScript)
- `onclick` → `onClick` (camelCase for all event handlers)
- `{expression}` - Curly braces embed JavaScript expressions
- Self-closing tags must end with `/` (e.g., `<img />`)

### React Components

A **component** is a reusable piece of UI. This project uses **function components**:

```tsx
// Example: Calendar component
interface CalendarProps {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  courseColors: Record<string, string>;
}

export function Calendar({ leftCollapsed, rightCollapsed, courseColors }: CalendarProps) {
  // Component logic
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  
  // Return JSX
  return (
    <div className="flex-1 p-8">
      {/* Calendar UI */}
    </div>
  );
}
```

**Component Pattern**:
1. Define props interface (TypeScript)
2. Destructure props in function parameters
3. Use hooks for state and effects
4. Return JSX

### Props: Component Communication

**Props** pass data from parent to child components:

```tsx
// Parent component (CalendarView.tsx)
<Calendar 
  leftCollapsed={leftCollapsed}
  rightCollapsed={rightCollapsed}
  courseColors={courseColors}
/>

// Child component (Calendar.tsx)
interface CalendarProps {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  courseColors: Record<string, string>;
}

export function Calendar({ leftCollapsed, rightCollapsed, courseColors }: CalendarProps) {
  // Use the props
}
```

**Props are immutable** - child components cannot modify them.

### State: Interactive Data

**State** is data that can change over time. When state updates, React re-renders the component:

```tsx
import { useState } from 'react';

export function Calendar() {
  // Declare state: [value, setter] = useState(initialValue)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  
  const nextMonth = () => {
    // Update state triggers re-render
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  return <button onClick={nextMonth}>Next Month</button>;
}
```

**Pattern**: `const [value, setValue] = useState(initialValue);`

### React Hooks

**Hooks** are special functions that let you use React features. They always start with `use`.

#### Common Hooks in This Project

| Hook | Purpose | Example |
|------|---------|---------|
| `useState` | Manage component state | `const [date, setDate] = useState(new Date())` |
| `useEffect` | Run side effects | Data fetching, subscriptions, DOM updates |
| `useContext` | Access context values | `const { completedEventIds } = useCompletedEvents()` |
| `useCallback` | Memoize functions | Prevent unnecessary re-renders |
| `useMemo` | Memoize values | Expensive calculations |
| `useParams` | Get URL parameters | `/course/:courseId` → `{ courseId: "1" }` |
| `useNavigate` | Navigate programmatically | `navigate('/course-list')` |
| `useSearchParams` | URL query parameters | `?month=0&year=2026` |

#### useState Example

```tsx
const [leftCollapsed, setLeftCollapsed] = useState(false);

// Toggle sidebar
const toggleLeft = () => setLeftCollapsed(!leftCollapsed);
```

#### useEffect Example

```tsx
// Sync state with URL parameters
useEffect(() => {
  if (urlMonth && urlYear) {
    setCurrentDate(new Date(parseInt(urlYear), parseInt(urlMonth), 1));
  }
}, [urlMonth, urlYear]); // Runs when urlMonth or urlYear changes
```

**Dependency array** (`[urlMonth, urlYear]`): Effect runs when these values change.

#### useContext Example

See "Context API" section below.

### Context API: Global State Management

**Context** shares state across the entire app without prop drilling.

#### Creating Context

```tsx
// CompletedEventsContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Create context
const CompletedEventsContext = createContext<CompletedEventsContextType | undefined>(undefined);

// 2. Create provider component
export function CompletedEventsProvider({ children }: { children: ReactNode }) {
  const [completedEventIds, setCompletedEventIds] = useState<Set<string>>(new Set());
  
  const completeEvent = (id: string) => {
    setCompletedEventIds(prev => new Set([...prev, id]));
  };
  
  return (
    <CompletedEventsContext.Provider value={{ completedEventIds, completeEvent }}>
      {children}
    </CompletedEventsContext.Provider>
  );
}

// 3. Create custom hook for consuming context
export function useCompletedEvents() {
  const context = useContext(CompletedEventsContext);
  if (context === undefined) {
    throw new Error('useCompletedEvents must be used within CompletedEventsProvider');
  }
  return context;
}
```

#### Using Context

```tsx
// 1. Wrap app with provider (root.tsx)
<CompletedEventsProvider>
  <App />
</CompletedEventsProvider>

// 2. Use context in any component
import { useCompletedEvents } from '~/context/CompletedEventsContext';

function Calendar() {
  const { completedEventIds, completeEvent } = useCompletedEvents();
  
  const isCompleted = completedEventIds.has(event.id);
}
```

**Contexts in this project**:
- `CompletedEventsContext` - Track which events are completed
- `CustomEventsContext` - Manage user-created events
- `EventDescriptionsContext` - Store event descriptions/notes
- `WhatIfModeContext` - Enable "what-if" planning mode

## React Router v7

### Routing Structure

Routes are defined in [app/routes.ts](../../frontend/app/routes.ts) using React Router v7's config-based routing:

```typescript
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),                          // "/"
  route("course/:courseId", "routes/course.tsx"),    // "/course/1"
  route("course-list", "routes/course-list.tsx"),    // "/course-list"
  route("timeline/:date", "routes/timeline.tsx"),    // "/timeline/2026-1-15"
  route("event/:eventId", "routes/event.tsx"),       // "/event/assign-1"
  route("profile", "routes/profile.tsx"),            // "/profile"
  route("degree-progress", "routes/degree-progress.tsx"), // "/degree-progress"
] satisfies RouteConfig;
```

| Function | Usage | Example URL |
|----------|-------|-------------|
| `index()` | Home page | `/` |
| `route("path", "file")` | Static path | `/course-list` |
| `route("path/:param", "file")` | Dynamic parameter | `/course/1` |

**Dynamic parameters** (`:courseId`, `:date`) capture part of the URL as a variable.

### Route File Structure

Each route file exports:

```tsx
import type { Route } from "./+types/home";

// Optional: Set page metadata
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Smart Academic Calendar" },
    { name: "description", content: "Calendar app" },
  ];
}

// Required: The page component
export default function Home() {
  return <div>Home Page</div>;
}
```

### Navigation

#### Method 1: Link Component

Use `<Link>` for clickable navigation:

```tsx
import { Link } from 'react-router';

// Static link
<Link to="/course-list">View Courses</Link>

// Dynamic link
<Link to={`/course/${course.id}`}>{course.name}</Link>

// With URL parameters
<Link to={`/timeline/${year}-${month}-${day}`}>View Day</Link>
```

#### Method 2: useNavigate Hook

Use `useNavigate()` for programmatic navigation:

```tsx
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/course-list');
  };

  const goBack = () => {
    navigate(-1); // Go back one page
  };
}
```

### Reading URL Parameters

#### Dynamic Segments (useParams)

```tsx
import { useParams } from 'react-router';

// URL: /course/5
const { courseId } = useParams<{ courseId: string }>();
// courseId = "5"
```

#### Query Parameters (useSearchParams)

```tsx
import { useSearchParams } from 'react-router';

// URL: /?month=0&year=2026
const [searchParams, setSearchParams] = useSearchParams();

const month = searchParams.get('month');  // "0"
const year = searchParams.get('year');    // "2026"

// Update query params
setSearchParams({ month: '1', year: '2026' });
```

### Root Layout

[app/root.tsx](../../frontend/app/root.tsx) wraps all pages:

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />      {/* Meta tags */}
        <Links />     {/* CSS links */}
      </head>
      <body>
        {/* Context providers wrap all pages */}
        <WhatIfModeProvider>
          <CustomEventsProvider>
            <CompletedEventsProvider>
              <EventDescriptionsProvider>
                {children}
              </EventDescriptionsProvider>
            </CompletedEventsProvider>
          </CustomEventsProvider>
        </WhatIfModeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;  {/* Current route renders here */}
}
```

## Code Conventions

### Imports

**ALWAYS** use path alias `~/` instead of relative paths:

```tsx
// ✅ CORRECT
import { Calendar } from '~/components/Calendar';
import { useCompletedEvents } from '~/context/CompletedEventsContext';
import { generateEvents } from '~/utils/generateEvents';

// ❌ WRONG - Never use relative paths
import { Calendar } from '../../../components/Calendar';
import { useCompletedEvents } from '../../context/CompletedEventsContext';
```

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react';
import { Link } from 'react-router';
import { Calendar } from '~/components/Calendar';

// 2. Type definitions
interface MyComponentProps {
  title: string;
  count: number;
}

// 3. Component function
export function MyComponent({ title, count }: MyComponentProps) {
  // 4. Hooks (at the top)
  const [isOpen, setIsOpen] = useState(false);
  
  // 5. Event handlers
  const handleClick = () => {
    setIsOpen(!isOpen);
  };
  
  // 6. Return JSX
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleClick}>Toggle</button>
    </div>
  );
}
```

### Styling with Tailwind

Use Tailwind utility classes only - **no separate CSS files** except `app/app.css`:

```tsx
<div className="flex items-center gap-2 p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
  <span className="text-sm font-semibold text-gray-700">Event</span>
</div>
```

**Common patterns**:
- Layout: `flex`, `grid`, `gap-4`, `p-4`, `m-2`
- Sizing: `w-full`, `h-screen`, `max-w-md`
- Colors: `bg-blue-500`, `text-white`, `border-gray-300`
- States: `hover:bg-blue-600`, `focus:ring-2`, `disabled:opacity-50`

### Conditional Rendering

```tsx
// Show/hide elements
{isVisible && <div>Visible content</div>}

// Ternary operator
<div className={isActive ? 'bg-blue-500' : 'bg-gray-200'}>
  {isActive ? 'Active' : 'Inactive'}
</div>

// Multiple conditions
{isLoading ? (
  <Spinner />
) : error ? (
  <ErrorMessage />
) : (
  <Content />
)}
```

### Rendering Lists

```tsx
// Map over array
{events.map(event => (
  <div key={event.id}>  {/* key is required */}
    {event.title}
  </div>
))}

// Filter and map
{events
  .filter(event => event.type === 'assignment')
  .map(event => (
    <div key={event.id}>{event.title}</div>
  ))}
```

**Always provide a unique `key` prop** when rendering lists - React uses it to track which items changed.

### TypeScript Patterns

```tsx
// Props interface
interface CalendarProps {
  date: Date;
  events: CalendarEvent[];
  onDateChange: (date: Date) => void;
}

// Union types
type EventTag = 'school' | 'work' | 'personal' | 'meeting' | 'fun';

// Optional properties
interface User {
  name: string;
  email?: string;  // Optional
}

// Generic types
const [items, setItems] = useState<CalendarEvent[]>([]);

// Record type (object with string keys)
const courseColors: Record<string, string> = {
  'CS101': '#3b82f6',
  'CS102': '#10b981'
};
```

## Key Data Flow

### Course Data
1. **Source**: [app/data/bscsCoursesData.ts](../../frontend/app/data/bscsCoursesData.ts) - BSCS course catalog
2. **Export**: [app/data/courses.ts](../../frontend/app/data/courses.ts) - Re-exports course data
3. **Usage**: Components import `enrolledCourses` from `~/data/courses`

### Event Generation
1. **Input**: Course schedules (e.g., `"MWF 10:00-11:00"`)
2. **Parser**: [app/utils/generateEvents.ts](../../frontend/app/utils/generateEvents.ts) - `generateEvents()` function
3. **Output**: `CalendarEvent[]` with dates, times, colors, tags

**Schedule format**: `"MWF 10:00-11:00"` or `"TuTh 14:00-15:30"`
**Day abbreviations**: Su, M, Tu, W, Th, F, Sa

### Tag System
Defined in [app/utils/tagUtils.ts](../../frontend/app/utils/tagUtils.ts):

```typescript
type EventTag = 'school' | 'work' | 'personal' | 'meeting' | 'fun';
```

Each event has a tag for categorization and color coding.

## Common Patterns

### Modal Pattern

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';

function MyModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        <div>Modal content</div>
      </DialogContent>
    </Dialog>
  );
}
```

### Form Handling

```tsx
function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Data Fetching Pattern

```tsx
function DataComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []); // Empty array = run once on mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{/* Render data */}</div>;
}
```

## Development Commands

```bash
# Development
npm run dev       # Start dev server at http://localhost:5173 (HMR enabled)

# Building
npm run build     # Production build to build/ directory
npm run start     # Serve production build

# Quality Checks
npm run typecheck # Run TypeScript type checking
npm run test      # Run Vitest tests (when configured)
```

## Testing

Test files use pattern `*.test.tsx` alongside components. Uses **Vitest** and **React Testing Library**.

```tsx
// Example test
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { Calendar } from './Calendar';

test('renders calendar', () => {
  render(<Calendar leftCollapsed={false} rightCollapsed={false} courseColors={{}} />);
  expect(screen.getByText(/January/i)).toBeInTheDocument();
});
```

## Docker

Multi-stage Dockerfile: installs dependencies → builds with Vite → serves production build.

```bash
docker build -t student-planner .
docker run -p 3000:3000 student-planner
```

## Important Files

### Core Configuration
- [app/routes.ts](../../frontend/app/routes.ts) - Route definitions
- [app/root.tsx](../../frontend/app/root.tsx) - Root layout with providers
- [vite.config.ts](../../frontend/vite.config.ts) - Vite + React Router + Tailwind config
- [tsconfig.json](../../frontend/tsconfig.json) - TypeScript configuration
- [package.json](../../frontend/package.json) - Dependencies and scripts

### Main Components
- [app/components/CalendarView.tsx](../../frontend/app/components/CalendarView.tsx) - Calendar page layout
- [app/components/Calendar.tsx](../../frontend/app/components/Calendar.tsx) - Calendar grid component
- [app/components/Sidebar.tsx](../../frontend/app/components/Sidebar.tsx) - Course list sidebar
- [app/components/ToDoSidebar.tsx](../../frontend/app/components/ToDoSidebar.tsx) - To-do list sidebar
- [app/components/Navbar.tsx](../../frontend/app/components/Navbar.tsx) - Top navigation

### Page Routes
- [app/routes/home.tsx](../../frontend/app/routes/home.tsx) - Main calendar page
- [app/routes/course.tsx](../../frontend/app/routes/course.tsx) - Course detail page
- [app/routes/timeline.tsx](../../frontend/app/routes/timeline.tsx) - Daily timeline view

### Data & Utils
- [app/data/bscsCoursesData.ts](../../frontend/app/data/bscsCoursesData.ts) - Course catalog with prerequisites
- [app/utils/generateEvents.ts](../../frontend/app/utils/generateEvents.ts) - Event generation logic
- [app/utils/tagUtils.ts](../../frontend/app/utils/tagUtils.ts) - Event tagging system

### Context
- [app/context/CompletedEventsContext.tsx](../../frontend/app/context/CompletedEventsContext.tsx) - Completed events
- [app/context/CustomEventsContext.tsx](../../frontend/app/context/CustomEventsContext.tsx) - Custom events
- [app/context/EventDescriptionsContext.tsx](../../frontend/app/context/EventDescriptionsContext.tsx) - Event descriptions
- [app/context/WhatIfModeContext.tsx](../../frontend/app/context/WhatIfModeContext.tsx) - What-if planning

## Integration with Backend

The React frontend (port 5173) communicates with the Spring Boot backend (port 8080) via REST API:

- **API Base URL**: `http://localhost:8080/api`
- **Service Files**: Located in `app/services/`
- **CORS**: Backend configured to allow requests from `http://localhost:5173`

## Additional Resources

- [docs/frontend/01-REACT-FUNDAMENTALS.md](../../docs/frontend/01-REACT-FUNDAMENTALS.md) - Detailed React guide for beginners
- [docs/frontend/03-REACT-ROUTER-GUIDE.md](../../docs/frontend/03-REACT-ROUTER-GUIDE.md) - Comprehensive React Router documentation
- [docs/frontend/04-CALENDAR-PROJECT-FILES.md](../../docs/frontend/04-CALENDAR-PROJECT-FILES.md) - Project-specific file explanations
- [docs/frontend/HOW_TO_RUN.md](../../docs/frontend/HOW_TO_RUN.md) - Detailed startup instructions
