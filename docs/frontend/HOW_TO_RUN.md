# How to Run - Frontend (React + Vite)

This guide explains how to run the frontend application for local development.

---

## 🚀 Quick Start (3 Steps)

```powershell
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev
```

**Frontend running at:** http://localhost:5173

---

## 📋 Prerequisites

### Required

- **Node.js v20 or higher** - [Download here](https://nodejs.org/)
  - LTS version recommended (v20.x.x)
  - Includes npm (Node Package Manager)

### Verify Installation

```powershell
node --version   # Should show v20.x.x or higher
npm --version    # Should show 9.x.x or higher
```

---

## 📦 Installing Dependencies

From the `frontend/` directory:

```powershell
npm install
```

This downloads all packages from `package.json`:
- **React 19** - UI framework
- **React Router 7** - Routing and SSR
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **Recharts** - Charts

**First-time install:** Takes 2-3 minutes (~200MB in `node_modules/`)

---

## 💻 Running the Development Server

```powershell
npm run dev
```

**Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
  ➜  press h + enter to show help
```

### Development Features

| Feature | Description |
|---------|-------------|
| ⚡ **Hot Module Replacement** | Changes reflect instantly without refresh |
| 🔄 **Auto Reload** | Page reloads when needed |
| 📝 **Error Overlay** | Detailed errors shown in browser |
| 🔍 **Source Maps** | Debug original TypeScript code |

### Stopping the Server

Press `Ctrl+C` in the terminal.

---

## 🔌 Connecting to Backend (Optional)

The frontend can run standalone with mock data, but to connect to the backend API:

### Option 1: Start Backend via VS Code Debugger

1. Open VS Code in the monorepo root
2. Press `F5` or select **Run > Start Debugging**
3. Choose **"Spring Boot (Dev)"** configuration
4. Backend starts at http://localhost:8080/api

### Option 2: Start Database Only (for Backend)

From `backend/` directory:
```powershell
docker-compose up -d postgres pgadmin
```

Then start the backend via VS Code debugger.

### API Configuration

The frontend connects to the backend at:
```
http://localhost:8080/api
```

Service files in `app/services/` handle API calls.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Create production build |
| `npm start` | Run production server (port 3000) |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── components/     # React components
│   │   ├── ui/         # shadcn/ui primitives
│   │   ├── Calendar.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── routes/         # Page components (file-based routing)
│   │   ├── home.tsx    # "/" - Main calendar
│   │   ├── course.tsx  # "/course/:id"
│   │   └── ...
│   ├── context/        # React Context providers
│   ├── data/           # Static data (courses, etc.)
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions
│   ├── root.tsx        # App root layout
│   ├── routes.ts       # Route definitions
│   └── app.css         # Global styles
├── public/             # Static assets
├── package.json        # Dependencies
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

---

## 🌐 Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `routes/home.tsx` | Main calendar view |
| `/course/:courseId` | `routes/course.tsx` | Course details |
| `/courses` | `routes/courses.tsx` | Course list |
| `/timeline/:date` | `routes/timeline.tsx` | Daily timeline |
| `/degree-progress` | `routes/degree-progress.tsx` | Degree tracking |
| `/profile` | `routes/profile.tsx` | User profile |
| `/personal` | `routes/personal.tsx` | Personal tools hub |
| `/budget-planner` | `routes/budget-planner.tsx` | Budget tracking |
| `/time-blocking` | `routes/time-blocking.tsx` | Time planning |
| `/study` | `routes/study.tsx` | Study tools |

---

## 🔧 Troubleshooting

### Port 5173 Already in Use

Vite automatically tries the next available port (5174, 5175, etc.).

To manually free the port:
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

### Module Not Found Errors

Reinstall dependencies:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### TypeScript Errors

Run type checking:
```powershell
npm run typecheck
```

### Styles Not Applying

1. Check `app.css` imports Tailwind
2. Verify `vite.config.ts` includes Tailwind plugin
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Can't Connect to Backend API

1. Verify backend is running on port 8080
2. Check CORS configuration allows `http://localhost:5173`
3. Check browser console for network errors
4. Verify service files use correct API URL

---

## 🧪 Running Tests

```powershell
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

Test files are located alongside components with `.test.tsx` extension.

---

## 🏗️ Building for Production

```powershell
# Create production build
npm run build

# Preview production build locally
npm start
```

Production build creates:
- `build/client/` - Static assets
- `build/server/` - SSR files

Production server runs at: http://localhost:3000

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Framework |
| React Router | 7.x | Routing & SSR |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Vite | 7.x | Build Tool & Dev Server |
| Radix UI | Latest | Accessible Components |
| Lucide React | Latest | Icons |
| Recharts | 3.x | Charts |
| Vitest | Latest | Testing |

---

## 📚 Additional Resources

- [01-REACT-FUNDAMENTALS.md](./01-REACT-FUNDAMENTALS.md) - React basics
- [02-VITE-AND-BUILD-TOOLS.md](./02-VITE-AND-BUILD-TOOLS.md) - Build tooling
- [03-REACT-ROUTER-GUIDE.md](./03-REACT-ROUTER-GUIDE.md) - Routing guide
- [04-CALENDAR-PROJECT-FILES.md](./04-CALENDAR-PROJECT-FILES.md) - Project files overview
- [05-TESTING-WITH-VITEST.md](./05-TESTING-WITH-VITEST.md) - Testing guide
- [CREATING_FRONTEND_SERVICES.md](./CREATING_FRONTEND_SERVICES.md) - API services
