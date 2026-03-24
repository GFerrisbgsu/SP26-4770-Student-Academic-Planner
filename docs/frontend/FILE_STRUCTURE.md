# Frontend File Structure Guide

A comprehensive guide to every file in the React frontend for newcomers.

---

## 📁 Directory Overview

```
frontend/
├── app/                        # Main application code
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── figma/              # Figma-generated components
│   ├── routes/                 # Page components (file-based routing)
│   ├── data/                   # Static data and types
│   ├── services/               # API service functions
│   ├── context/                # React Context providers
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript type definitions
│   ├── test/                   # Test setup files
│   └── assets/                 # Images and static files
├── public/                     # Static assets (favicon, etc.)
├── build/                      # Production build output
├── node_modules/               # Dependencies (auto-generated)
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
└── react-router.config.ts      # React Router configuration
```

---

## 🔧 Root Configuration Files

### `package.json`
**Purpose:** Defines project dependencies, scripts, and metadata

**Key Sections:**
| Section | Purpose |
|---------|---------|
| `scripts` | Commands like `npm run dev`, `npm run build` |
| `dependencies` | Production packages (React, etc.) |
| `devDependencies` | Development tools (Vite, TypeScript, etc.) |

**Main Dependencies:**
- `react` (19.x) - UI framework
- `react-router` (7.x) - Routing and SSR
- `tailwindcss` (4.x) - Styling
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react` - Icons
- `recharts` - Charts

**Available Scripts:**
| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `npm run dev` | Start dev server (port 5173) |
| `build` | `npm run build` | Create production build |
| `start` | `npm start` | Run production server |
| `typecheck` | `npm run typecheck` | TypeScript validation |
| `test` | `npm test` | Run Vitest tests |

**When to modify:** Adding dependencies, changing scripts

---

### `vite.config.ts`
**Purpose:** Vite build tool configuration

**Key Configurations:**
- `tailwindcss()` - Tailwind CSS plugin
- `reactRouter()` - React Router integration
- `tsconfigPaths()` - Path alias support (`~/`)
- `test` - Vitest configuration

**Test Settings:**
- Environment: jsdom (browser simulation)
- Setup file: `./app/test/setup.ts`
- Pattern: `app/**/*.test.{ts,tsx}`

**When to modify:** Adding Vite plugins, changing build settings

---

### `tsconfig.json`
**Purpose:** TypeScript compiler configuration

**Key Settings:**
| Setting | Value | Purpose |
|---------|-------|---------|
| `target` | ES2022 | JavaScript output version |
| `jsx` | react-jsx | JSX transformation |
| `strict` | true | Enable all type checks |
| `paths` | `"~/*": ["./app/*"]` | Import alias |

**Path Alias:**
```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '~/components/ui/button'  // Uses ~/ alias
```

**When to modify:** Changing TypeScript strictness, adding path aliases

---

### `react-router.config.ts`
**Purpose:** React Router framework configuration

**Settings:**
- SSR mode configuration
- Route discovery settings

**When to modify:** Changing SSR behavior, route configuration

---

### `Dockerfile`
**Purpose:** Container build instructions for frontend

**Build Process:**
1. Install Node.js dependencies
2. Build production bundle
3. Create optimized runtime image

**When to modify:** Changing Node version, build process

---

### `.dockerignore`
**Purpose:** Files to exclude from Docker build

**Excluded:**
- `node_modules/`
- `build/`
- `.git/`
- Log files

**When to modify:** Rarely needed

---

## 📱 App Core Files (`app/`)

### `root.tsx`
**Purpose:** Application root layout - wraps all pages

**Responsibilities:**
- HTML document structure (`<html>`, `<head>`, `<body>`)
- Global font imports (Google Fonts - Inter)
- Context providers (if any)
- Error boundary for the entire app
- Startup API calls (fetches users on mount)

**Key Components:**
| Component | Purpose |
|-----------|---------|
| `<Meta />` | Renders page meta tags |
| `<Links />` | Renders CSS stylesheets |
| `<Scripts />` | Renders JavaScript bundles |
| `<ScrollRestoration />` | Restores scroll position |
| `<Outlet />` | Renders current route's page |

**Exports:**
- `links` - External stylesheet links
- `Layout` - HTML document wrapper
- `App` - Main app component
- `ErrorBoundary` - Error handling UI

**When to modify:** Adding global providers, changing document structure

---

### `routes.ts`
**Purpose:** Route definitions - maps URLs to page components

**Route Configuration:**
```typescript
export default [
  index("routes/home.tsx"),                    // "/"
  route("course/:courseId", "routes/course.tsx"),  // "/course/1"
  route("courses", "routes/courses.tsx"),      // "/courses"
  // ... more routes
] satisfies RouteConfig;
```

**Route Types:**
| Function | Example | URL Pattern |
|----------|---------|-------------|
| `index()` | `index("routes/home.tsx")` | `/` |
| `route()` | `route("courses", "...")` | `/courses` |
| Dynamic | `route("course/:id", "...")` | `/course/123` |

**When to modify:** Adding new pages, changing URL structure

---

### `app.css`
**Purpose:** Global styles and Tailwind CSS imports

**Contents:**
- Tailwind CSS base, components, utilities
- Custom CSS variables (colors, fonts)
- Global element styles

**When to modify:** Adding global styles, CSS variables

---

## 📄 Route Pages (`app/routes/`)

Each file = one page accessible via URL.

### `home.tsx`
**URL:** `/`
**Purpose:** Main calendar view - the landing page

**Features:**
- Calendar component with week view
- To-do sidebar
- Event management
- What-If mode toggle

**State Management:**
- `customEvents` - User-created events
- `courseColors` - Color customization
- `isWhatIfMode` - Planning mode toggle

---

### `course.tsx`
**URL:** `/course/:courseId`
**Purpose:** Individual course details page

**Features:**
- Course information display
- Notes and files section
- Assignment list
- Color customization

**URL Parameter:** `courseId` - identifies which course

---

### `courses.tsx`
**URL:** `/courses`
**Purpose:** Course catalog and enrollment

**Features:**
- List of all available courses
- Enrolled courses section
- Course search/filter
- What-If mode course selection

---

### `timeline.tsx`
**URL:** `/timeline/:date`
**Purpose:** Daily schedule view

**Features:**
- Hour-by-hour timeline
- Events for selected date
- Navigation between days
- Event conflict highlighting

**URL Parameter:** `date` - format: `YYYY-M-D` (e.g., `2026-1-15`)

---

### `event.tsx`
**URL:** `/event/:eventId`
**Purpose:** Individual event details

**Features:**
- Event information
- Edit/delete options
- Course association

---

### `degree-progress.tsx`
**URL:** `/degree-progress`
**Purpose:** Academic progress tracking

**Features:**
- Degree requirements visualization
- Completed courses
- Remaining requirements
- Progress charts (using Recharts)

---

### `profile.tsx`
**URL:** `/profile`
**Purpose:** User profile page

**Features:**
- User information display
- Settings
- Account management

---

### `personal.tsx`
**URL:** `/personal`
**Purpose:** Personal tools hub

**Features:**
- Links to personal tools
- Budget planner access
- Time blocking access

---

### `budget-planner.tsx`
**URL:** `/budget-planner`
**Purpose:** Financial planning tool

**Features:**
- Income/expense tracking
- Budget categories
- Visual charts

---

### `time-blocking.tsx`
**URL:** `/time-blocking`
**Purpose:** Time management tool

**Features:**
- Block scheduling
- Time allocation
- Productivity tracking

---

### `study.tsx`
**URL:** `/study`
**Purpose:** Study tools and resources

**Features:**
- Study planning
- Resource links
- Study session tracking

---

## 🧩 Components (`app/components/`)

Reusable UI pieces used across multiple pages.

### Main Application Components

#### `Calendar.tsx`
**Purpose:** Main calendar grid component

**Features:**
- Week view display
- Event rendering
- Navigation (prev/next week)
- Tag filtering (school, work, personal, etc.)
- Conflict detection
- Click to view day timeline

**Props:**
| Prop | Type | Purpose |
|------|------|---------|
| `customEvents` | `CalendarEvent[]` | User-created events |
| `courseColors` | `Record<string, string>` | Course color mapping |
| `whatIfCourseIds` | `string[]` | Courses for What-If mode |
| `onAddEvent` | `() => void` | Add event callback |

---

#### `CalendarView.tsx`
**Purpose:** Calendar page layout wrapper

**Composition:**
- Navbar (top)
- Calendar (left)
- ToDoSidebar (right)
- AddEventModal (overlay)

**Responsibilities:**
- Layout management
- Event state coordination
- Modal control

---

#### `Navbar.tsx`
**Purpose:** Top navigation bar

**Features:**
- App logo and title
- Navigation links
- Mobile responsive menu
- Active route highlighting

**Navigation Links:**
| Link | Icon | Route |
|------|------|-------|
| Calendar | CalendarIcon | `/` |
| Courses | List | `/courses` |
| Progress | BookOpen | `/degree-progress` |
| Personal | User | `/personal` |
| Study | Lightbulb | `/study` |

---

#### `Sidebar.tsx`
**Purpose:** Course list sidebar

**Features:**
- Enrolled courses list
- Course color indicators
- Color picker trigger
- What-If mode toggle
- Conflict warnings

---

#### `ToDoSidebar.tsx`
**Purpose:** Task management sidebar

**Features:**
- Upcoming tasks/assignments
- Tag filtering
- Complete/uncomplete toggle
- Task grouping by tag

---

#### `TimelinePage.tsx`
**Purpose:** Daily timeline view

**Features:**
- Hour-by-hour schedule
- Event blocks
- Day navigation
- Conflict highlighting

---

#### `AddEventModal.tsx`
**Purpose:** Modal for creating custom events

**Features:**
- Date/time selection
- Event title and description
- Tag selection
- Conflict detection warning

---

#### `ColorPickerModal.tsx`
**Purpose:** Course color selection modal

**Features:**
- Color palette display
- Current color indicator
- Color preview

---

#### `DegreeProgressPage.tsx`
**Purpose:** Academic progress visualization

**Features:**
- Progress charts
- Requirement tracking
- Course completion status

---

#### `CoursePage.tsx` / `EnhancedCoursePage.tsx`
**Purpose:** Course detail display

**Features:**
- Course information
- Schedule display
- Instructor info
- Related events

---

#### `CoursesPage.tsx` / `CourseListPage.tsx`
**Purpose:** Course catalog display

**Features:**
- Course listing
- Search/filter
- Enrollment management

---

#### `ProfilePage.tsx`
**Purpose:** User profile display

---

#### `PersonalPage.tsx`
**Purpose:** Personal tools hub

---

#### `BudgetPlanner.tsx`
**Purpose:** Budget management interface

---

#### `TimeBlocking.tsx`
**Purpose:** Time block scheduling interface

---

#### `EventPage.tsx`
**Purpose:** Event detail display

---

#### `FloatingAddButton.tsx`
**Purpose:** Floating action button for adding events

---

### UI Primitives (`components/ui/`)

**Source:** shadcn/ui - Radix UI primitives with Tailwind styling

These are low-level building blocks for the UI:

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Clickable buttons with variants |
| `card.tsx` | Content container cards |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `input.tsx` | Text input fields |
| `select.tsx` | Selection dropdowns |
| `checkbox.tsx` | Checkboxes |
| `tabs.tsx` | Tab navigation |
| `table.tsx` | Data tables |
| `progress.tsx` | Progress bars |
| `badge.tsx` | Status badges |
| `tooltip.tsx` | Hover tooltips |
| `calendar.tsx` | Date picker calendar |
| `chart.tsx` | Chart components (Recharts wrapper) |
| `form.tsx` | Form components |
| `sheet.tsx` | Slide-out panels |
| `drawer.tsx` | Bottom/side drawers |
| `popover.tsx` | Popover content |
| `separator.tsx` | Visual separators |
| `skeleton.tsx` | Loading skeletons |
| `switch.tsx` | Toggle switches |
| `textarea.tsx` | Multi-line text input |
| `label.tsx` | Form labels |
| `scroll-area.tsx` | Scrollable containers |
| ... | And more! |

**Utility Files:**
- `utils.ts` - `cn()` function for merging Tailwind classes
- `use-mobile.ts` - Mobile detection hook

**When to modify:** Customizing component styles/variants

---

### Figma Components (`components/figma/`)

#### `ImageWithFallback.tsx`
**Purpose:** Image component with fallback for missing images

---

## 📊 Data Files (`app/data/`)

Static data and type definitions for the application.

### `courses.ts`
**Purpose:** Course data exports and types

**Exports:**
- `Course` interface - Course type definition
- `allCourses` - All available courses
- `enrolledCourses` - Currently enrolled courses

---

### `bscsCoursesData.ts`
**Purpose:** BS in Computer Science degree course data

**Contents:**
- Complete BSCS course catalog
- Course prerequisites
- Year/semester assignments
- Credit information

**Data Structure:**
```typescript
interface BSCSCourse {
  id: string;
  name: string;
  code: string;
  credits: number;
  year: 1 | 2 | 3 | 4;
  semester: 'Fall' | 'Spring' | 'Either';
  prerequisiteIds: string[];
  // ... more fields
}
```

---

### `courseData.ts`
**Purpose:** Additional course-related data and utilities

---

### `programsAndPrerequisites.ts`
**Purpose:** Degree program requirements and course prerequisites

**Contents:**
- Degree requirements
- Prerequisite mappings
- Course category definitions

---

## 🔌 Services (`app/services/`)

API communication with the backend.

### `userService.ts`
**Purpose:** User API operations

**Methods:**
| Method | HTTP | Endpoint | Purpose |
|--------|------|----------|---------|
| `getAllUsers()` | GET | `/api/users` | Fetch all users |
| `getUserById(id)` | GET | `/api/users/{id}` | Fetch single user |
| `createUser(data)` | POST | `/api/users` | Create new user |

**Configuration:**
- Base URL: `http://localhost:8080/api`
- Uses `fetch` API
- Returns typed responses

**When to modify:** Adding new API calls, changing endpoints

---

## 🛠️ Utilities (`app/utils/`)

Helper functions and utility code.

### `generateEvents.ts`
**Purpose:** Generate calendar events from course data

**Key Functions:**
| Function | Purpose |
|----------|---------|
| `generateEventsForMonth()` | Creates events for a month from course schedules |
| `getAllEventsForMonth()` | Combines generated and predefined events |
| `parseSchedule()` | Parses schedule strings like "MWF 10:00-11:00" |

**Exports:**
- `CalendarEvent` interface
- `assignmentEvents` - Predefined assignment events

---

### `generateEvents.test.ts`
**Purpose:** Unit tests for event generation

**Tests:**
- Schedule parsing
- Event generation
- Edge cases

---

### `tagUtils.ts`
**Purpose:** Event tag system utilities

**Tag Types:**
- `school` - Academic events (blue)
- `work` - Work events (green)
- `personal` - Personal events (purple)
- `meeting` - Meetings (orange)
- `fun` - Fun activities (pink)

**Exports:**
- `EventTag` type
- `tagConfig` - Tag colors and labels
- `getTagColor()` - Get color for tag
- `suggestTag()` - Auto-suggest tag based on title

---

## 📝 Types (`app/types/`)

TypeScript type definitions.

### `user.ts`
**Purpose:** User-related type definitions

**Interfaces:**
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}
```

---

## 🧪 Test Setup (`app/test/`)

### `setup.ts`
**Purpose:** Vitest test configuration

**Imports:**
- `@testing-library/jest-dom` - DOM matchers
- Custom test utilities

**When to modify:** Adding global test setup, mocks

---

## 🖼️ Assets (`app/assets/`)

Static image files.

**Contents:**
- PNG images used in the application
- Figma-exported assets

**Naming:** Hash-based names for cache busting

---

## 📁 Public (`public/`)

### `favicon.ico`
**Purpose:** Browser tab icon

Static files served directly without processing.

---

## 🏗️ Build Output (`build/`)

**Auto-generated** - Production build files

**Structure:**
- `client/` - Client-side assets (JS, CSS, images)
- `server/` - Server-side rendering files

**When to modify:** NEVER - auto-generated by `npm run build`

---

## 🔄 Adding New Features

### Adding a New Page

1. **Create Route File:** `app/routes/my-page.tsx`
2. **Add to Routes:** Update `app/routes.ts`
3. **Add Navigation:** Update `Navbar.tsx`

### Adding a New Component

1. **Create Component:** `app/components/MyComponent.tsx`
2. **Define Props Interface:** TypeScript interface
3. **Import Where Needed:** Using `~/components/MyComponent`

### Adding a New API Service

1. **Create Service:** `app/services/myService.ts`
2. **Define Types:** In `app/types/`
3. **Use in Components:** Import and call

### File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Routes | kebab-case | `degree-progress.tsx` |
| Components | PascalCase | `CalendarView.tsx` |
| Utils | camelCase | `generateEvents.ts` |
| Types | camelCase | `user.ts` |
| Tests | `*.test.ts(x)` | `generateEvents.test.ts` |

---

## 📚 Related Documentation

- [HOW_TO_RUN.md](HOW_TO_RUN.md) - Running the frontend
- [01-REACT-FUNDAMENTALS.md](01-REACT-FUNDAMENTALS.md) - React basics
- [02-VITE-AND-BUILD-TOOLS.md](02-VITE-AND-BUILD-TOOLS.md) - Build tooling
- [03-REACT-ROUTER-GUIDE.md](03-REACT-ROUTER-GUIDE.md) - Routing guide
- [04-CALENDAR-PROJECT-FILES.md](04-CALENDAR-PROJECT-FILES.md) - Calendar feature details
- [05-TESTING-WITH-VITEST.md](05-TESTING-WITH-VITEST.md) - Testing guide
- [CREATING_FRONTEND_SERVICES.md](CREATING_FRONTEND_SERVICES.md) - API services
