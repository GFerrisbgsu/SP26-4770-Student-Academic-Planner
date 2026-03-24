# React Router Guide

This guide explains how **React Router** handles navigation and pages in this project.

---

## 🤔 What is React Router?

**React Router** turns your single-page React app into a multi-page experience:

- `/` → Shows the calendar home page
- `/course/1` → Shows details for course with ID 1
- `/timeline/2026-1-15` → Shows the schedule for January 15, 2026

Without React Router, you'd have only one page. With it, different URLs show different content.

---

## 📁 File-Based Routing

This project uses **file-based routing**, meaning the files in `app/routes/` automatically become pages:

```
app/routes/
├── home.tsx           →  /
├── course.tsx         →  /course/:courseId
├── course-list.tsx    →  /course-list
├── timeline.tsx       →  /timeline/:date
├── event.tsx          →  /event/:eventId
├── profile.tsx        →  /profile
└── degree-progress.tsx →  /degree-progress
```

---

## 📄 The Routes Configuration

Routes are defined in [app/routes.ts](../app/routes.ts):

```typescript
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),                          // "/" - home page
  route("course/:courseId", "routes/course.tsx"),    // "/course/1", "/course/2", etc.
  route("course-list", "routes/course-list.tsx"),    // "/course-list"
  route("timeline/:date", "routes/timeline.tsx"),    // "/timeline/2026-1-15"
  route("event/:eventId", "routes/event.tsx"),       // "/event/assign-1"
  route("profile", "routes/profile.tsx"),            // "/profile"
  route("degree-progress", "routes/degree-progress.tsx"), // "/degree-progress"
] satisfies RouteConfig;
```

### Understanding the Syntax:

| Function | Usage | Example URL |
|----------|-------|-------------|
| `index()` | Home page (no path) | `/` |
| `route("path", "file")` | Static path | `/course-list` |
| `route("path/:param", "file")` | Dynamic parameter | `/course/1` |

**Dynamic parameters** (`:courseId`, `:date`) capture part of the URL as a variable.

---

## 📄 Anatomy of a Route File

Let's examine [app/routes/home.tsx](../app/routes/home.tsx):

```tsx
import type { Route } from "./+types/home";  // Auto-generated types
import { useState } from 'react';
import { CalendarView } from '~/components/CalendarView';
import { enrolledCourses } from '~/data/courses';

// Meta function: sets the page title and description
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Smart Academic Calendar" },
    { name: "description", content: "Smart Academic Calendar App" },
  ];
}

// Default export: the page component
export default function Home() {
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});

  return (
    <CalendarView 
      courseColors={courseColors} 
      onCourseColorChange={handleCourseColorChange}
    />
  );
}
```

### Key Parts:

| Export | Purpose |
|--------|---------|
| `meta()` | Sets page `<title>` and meta tags |
| `default function` | The actual page component that renders |

---

## 🔗 Navigating Between Pages

### Method 1: The `<Link>` Component

Use `<Link>` for clickable links:

```tsx
import { Link } from 'react-router';

// In your component:
<Link to="/course-list">
  View Course List
</Link>

// With dynamic parameter:
<Link to={`/course/${course.id}`}>
  {course.name}
</Link>

// With query parameters:
<Link to={`/timeline/${year}-${month}-${day}`}>
  View Day
</Link>
```

**Example from [Calendar.tsx](../app/components/Calendar.tsx):**

```tsx
<Link
  to={`/timeline/${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`}
  className="aspect-square p-2 border"
>
  {day}
</Link>
```

Clicking on a day in the calendar navigates to `/timeline/2026-1-15`.

### Method 2: The `useNavigate` Hook

Use `useNavigate` for programmatic navigation (after an action):

```tsx
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate after some logic
    navigate('/course-list');
  };

  const goBack = () => {
    // Navigate back to calendar with URL params
    navigate(`/?month=${month}&year=${year}`);
  };
}
```

**Example from [TimelinePage.tsx](../app/components/TimelinePage.tsx):**

```tsx
const navigate = useNavigate();

const navigateDay = (offset: number) => {
  const newDate = new Date(selectedDate);
  newDate.setDate(newDate.getDate() + offset);
  navigate(`/timeline/${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`);
};
```

---

## 📍 Reading URL Parameters

### Dynamic Segments with `useParams`

For URLs like `/course/:courseId`:

```tsx
import { useParams } from 'react-router';

function CoursePage() {
  // If URL is /course/5, params.courseId is "5"
  const { courseId } = useParams<{ courseId: string }>();
  
  return <div>Course ID: {courseId}</div>;
}
```

**Example from [TimelinePage.tsx](../app/components/TimelinePage.tsx):**

```tsx
const { date } = useParams<{ date: string }>();

// If URL is /timeline/2026-1-15, date is "2026-1-15"
const [year, month, day] = date.split('-').map(Number);
```

### Query Parameters with `useSearchParams`

For URLs like `/?month=0&year=2026`:

```tsx
import { useSearchParams } from 'react-router';

function Calendar() {
  const [searchParams] = useSearchParams();
  
  const month = searchParams.get('month');  // "0"
  const year = searchParams.get('year');    // "2026"
}
```

**Example from [Calendar.tsx](../app/components/Calendar.tsx):**

```tsx
const [searchParams] = useSearchParams();

const urlMonth = searchParams.get('month');
const urlYear = searchParams.get('year');

// Initialize with URL params if available
const initialDate = (urlMonth && urlYear) 
  ? new Date(parseInt(urlYear), parseInt(urlMonth), 1)
  : new Date(2026, 0, 1);
```

---

## 🏠 The Root Layout

[app/root.tsx](../app/root.tsx) is the **root layout** - it wraps every page:

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />      {/* Page meta tags */}
        <Links />     {/* CSS links */}
      </head>
      <body>
        {/* Context Providers wrap all pages */}
        <WhatIfModeProvider>
          <CustomEventsProvider>
            <CompletedEventsProvider>
              <EventDescriptionsProvider>
                {children}  {/* 👈 Each page renders here */}
              </EventDescriptionsProvider>
            </CompletedEventsProvider>
          </CustomEventsProvider>
        </WhatIfModeProvider>
        <ScrollRestoration />  {/* Remembers scroll position */}
        <Scripts />            {/* JavaScript bundles */}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;  {/* Renders the matched route */}
}
```

### Key Components:

| Component | Purpose |
|-----------|---------|
| `<Meta />` | Renders meta tags from route's `meta()` function |
| `<Links />` | Renders CSS link tags |
| `<Scripts />` | Renders JavaScript bundles |
| `<ScrollRestoration />` | Restores scroll position when navigating |
| `<Outlet />` | Where the current route's component renders |

---

## 🛡️ Error Handling

[root.tsx](../app/root.tsx) also handles errors:

```tsx
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404
      ? "The requested page could not be found."
      : error.statusText || details;
  }

  return (
    <main>
      <h1>{message}</h1>
      <p>{details}</p>
    </main>
  );
}
```

If a route doesn't exist (404) or throws an error, this component renders instead.

---

## 🗺️ Route Visualization

Here's how the routes connect:

```
/                           ← home.tsx (CalendarView)
│
├── /course-list            ← course-list.tsx (CourseListPage)
│
├── /course/:courseId       ← course.tsx (CoursePage)
│   └── /course/1           → Shows course 1
│   └── /course/2           → Shows course 2
│
├── /timeline/:date         ← timeline.tsx (TimelinePage)
│   └── /timeline/2026-1-15 → Shows Jan 15, 2026
│
├── /event/:eventId         ← event.tsx (EventPage)
│   └── /event/assign-1     → Shows assignment 1
│
├── /profile                ← profile.tsx (ProfilePage)
│
└── /degree-progress        ← degree-progress.tsx (DegreeProgressPage)
```

---

## 🔄 Navigation Flow Example

When a user clicks a day on the calendar:

1. **User clicks** day 15 in January 2026
2. **Link component**: `<Link to="/timeline/2026-1-15">`
3. **React Router** matches `/timeline/:date` route
4. **timeline.tsx** renders with `date = "2026-1-15"`
5. **TimelinePage component** parses the date and shows events

```tsx
// In Calendar.tsx - creates the link
<Link to={`/timeline/2026-1-15`}>
  <div>15</div>
</Link>

// In timeline.tsx - route file
export default function Timeline() {
  return <TimelinePage courseColors={courseColors} />;
}

// In TimelinePage.tsx - parses the URL
const { date } = useParams();  // "2026-1-15"
const [year, month, day] = date.split('-').map(Number);
// year = 2026, month = 1, day = 15
```

---

## 📚 Key Takeaways

1. **Routes are defined** in `app/routes.ts`
2. **Each route file** in `app/routes/` is a page
3. **`<Link>`** for declarative navigation
4. **`useNavigate`** for programmatic navigation
5. **`useParams`** reads dynamic URL segments (`:id`)
6. **`useSearchParams`** reads query parameters (`?key=value`)
7. **`root.tsx`** wraps all pages with providers and common elements

---

## 📖 Next Steps

Continue learning with:

- **[04-CALENDAR-PROJECT-FILES.md](./04-CALENDAR-PROJECT-FILES.md)** - Detailed explanation of the calendar application files
