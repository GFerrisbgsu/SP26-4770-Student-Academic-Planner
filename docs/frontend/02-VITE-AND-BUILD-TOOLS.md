# Vite and Build Tools Guide

This guide explains how **Vite** powers this project and what the configuration files do.

---

## 🤔 What is Vite?

**Vite** (pronounced "veet" - French for "fast") is a **build tool** that:

1. **Serves your code during development** - You write code, save, and see changes instantly in the browser
2. **Bundles your code for production** - Combines and optimizes all your files for deployment

### Why Vite instead of other tools?

| Feature | Vite | Old Tools (Webpack) |
|---------|------|---------------------|
| Dev server startup | ~300ms | 30+ seconds |
| Hot reload | Instant | 1-10 seconds |
| Configuration | Simple | Complex |

Vite is fast because it uses **native ES modules** during development instead of bundling everything.

---

## 📄 Configuration Files Explained

### [vite.config.ts](../vite.config.ts)

This is the main Vite configuration file:

```typescript
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),      // Enables Tailwind CSS
    reactRouter(),      // Enables React Router integration
    tsconfigPaths()     // Enables path aliases like ~/
  ],
});
```

**What each plugin does:**

| Plugin | Purpose |
|--------|---------|
| `tailwindcss()` | Processes Tailwind CSS utility classes |
| `reactRouter()` | Integrates React Router for file-based routing |
| `tsconfigPaths()` | Lets you use `~/components/Button` instead of `../../components/Button` |

---

### [react-router.config.ts](../react-router.config.ts)

Configures how React Router works:

```typescript
import type { Config } from "@react-router/dev/config";

export default {
  ssr: true,  // Server-side render by default
} satisfies Config;
```

**SSR (Server-Side Rendering)** means the HTML is generated on the server before being sent to the browser. This makes the initial page load faster.

---

### [tsconfig.json](../tsconfig.json)

TypeScript configuration:

```jsonc
{
  "compilerOptions": {
    "jsx": "react-jsx",        // Enable JSX support for React
    "strict": true,            // Enable all strict type checks
    "paths": {
      "~/*": ["./app/*"]       // Path alias: ~/ means app/
    }
  }
}
```

The **path alias** `~/` is super useful:

```typescript
// Without path alias (relative imports are confusing)
import { Calendar } from '../../../components/Calendar';

// With path alias (clear and consistent)
import { Calendar } from '~/components/Calendar';
```

---

### [package.json](../package.json)

Defines project dependencies and scripts:

```json
{
  "scripts": {
    "dev": "react-router dev",       // Start development server
    "build": "react-router build",   // Build for production
    "start": "react-router-serve ./build/server/index.js",  // Run production build
    "typecheck": "react-router typegen && tsc"  // Check types
  },
  "dependencies": {
    "react": "^19.2.3",              // React library
    "react-dom": "^19.2.3",          // React DOM rendering
    "react-router": "^7.x",          // Routing library
    "lucide-react": "^0.563.0",      // Icon library
    // ... more dependencies
  }
}
```

---

## 🚀 How to Run the Project

### Development Mode

```bash
npm run dev
```

This starts the Vite dev server. You'll see something like:

```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

**Features of dev mode:**
- ⚡ **Hot Module Replacement (HMR)** - Edit code, see changes instantly without refresh
- 🔍 **Source maps** - Debug your actual TypeScript code in browser DevTools
- ❌ **Error overlay** - Errors show directly in the browser

### Production Build

```bash
npm run build
npm run start
```

This creates optimized files in the `build/` folder:

```
build/
├── client/           # Browser files (JavaScript, CSS, images)
│   └── assets/       # Bundled and minified files
└── server/           # Server files for SSR
    └── index.js
```

---

## � Docker Integration

This project includes a **Dockerfile** that packages everything needed to run the app in a container.

### What is Docker?

**Docker** is a tool that packages your application and all its dependencies into a **container** - think of it like a lightweight, portable box that contains everything needed to run your app. This means:

- ✅ **"Works on my machine" problem solved** - The container runs the same everywhere
- ✅ **Easy deployment** - Just ship the container to any server with Docker
- ✅ **Isolated environment** - Your app runs separately from other apps

### Understanding the Dockerfile

The [Dockerfile](../Dockerfile) uses a technique called **multi-stage builds** to create a small, optimized container:

```dockerfile
# Stage 1: Install ALL dependencies (including dev tools)
FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# Stage 2: Install ONLY production dependencies
FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# Stage 3: Build the app using Vite
FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

# Stage 4: Final image - only what's needed to run
FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]
```

**Breaking it down:**

| Stage | Purpose | What it does |
|-------|---------|--------------|
| 1️⃣ `development-dependencies-env` | Get dev tools | Installs ALL npm packages (including TypeScript, Vite, etc.) |
| 2️⃣ `production-dependencies-env` | Get runtime deps | Installs ONLY packages needed to run the app |
| 3️⃣ `build-env` | Build the app | Uses Vite to compile TypeScript and bundle everything |
| 4️⃣ Final image | Run the app | Contains only the built files and production dependencies |

**Why multi-stage builds?**

Without multi-stage builds, your container would include TypeScript, Vite, and all dev tools - stuff you don't need to *run* the app. Multi-stage builds keep only what's necessary, resulting in a **smaller, more secure container**.

### Key Docker Commands

```bash
# Build the Docker image
docker build -t student-planner .

# Run the container
docker run -p 3000:3000 student-planner
```

| Command | What it does |
|---------|--------------|
| `docker build -t student-planner .` | Builds an image named "student-planner" from the Dockerfile |
| `docker run -p 3000:3000 student-planner` | Runs the container, mapping port 3000 to your computer |

After running these commands, visit `http://localhost:3000` to see your app!

### How Vite and Docker Work Together

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Build Process                  │
├─────────────────────────────────────────────────────────┤
│  1. Copy source code into container                     │
│  2. npm ci → Install dependencies                       │
│  3. npm run build → Vite compiles & bundles everything  │
│  4. Copy build output to final small container          │
│  5. npm run start → Serve the production build          │
└─────────────────────────────────────────────────────────┘
```

**Vite's role in Docker:**
- During the build stage, `npm run build` triggers Vite
- Vite compiles TypeScript, processes Tailwind CSS, and creates the optimized `build/` folder
- The final container only needs the `build/` folder and production dependencies to run

---

## �📁 The `build/` Folder

After running `npm run build`, you get:

```
build/
├── client/
│   └── assets/
│       ├── entry.client-Gml6P_Jh.js     # Main app bundle
│       ├── course-list-CbC2q96O.js      # Code-split chunk
│       ├── createLucideIcon-C1DUTlJc.js # Icons chunk
│       └── ...
└── server/
    └── index.js                         # Server entry point
```

**Why the weird file names?** (like `entry.client-Gml6P_Jh.js`)

The random characters are a **hash** of the file contents. This enables:
- **Cache busting** - When code changes, the filename changes, so browsers load the new version
- **Long-term caching** - Unchanged files keep the same name and stay cached

---

## 🛠️ How Vite Processes Your Code

### During Development:

```
You write code → Vite transforms it → Browser runs it
     ↓
   .tsx file
     ↓
Vite transforms JSX to JavaScript
     ↓
Browser understands it
```

### For Production Build:

```
Source files → Vite builds → Optimized bundle
     ↓
Multiple .tsx files
     ↓
1. TypeScript → JavaScript
2. JSX → createElement calls
3. Minification (smaller file size)
4. Code splitting (separate files)
5. Tree shaking (remove unused code)
     ↓
Optimized files in build/
```

---

## 🎨 Tailwind CSS Integration

This project uses **Tailwind CSS** for styling. Instead of writing CSS files, you use utility classes:

```tsx
// Traditional CSS approach
<div className="calendar-header">...</div>
// .calendar-header { padding: 8px; background: blue; }

// Tailwind approach (no separate CSS needed!)
<div className="p-8 bg-blue-500">...</div>
```

Tailwind is configured in `vite.config.ts` with the `tailwindcss()` plugin.

Common Tailwind classes in this project:

| Class | CSS Equivalent |
|-------|----------------|
| `p-8` | `padding: 2rem` |
| `flex` | `display: flex` |
| `bg-blue-500` | `background-color: #3b82f6` |
| `text-sm` | `font-size: 0.875rem` |
| `rounded-lg` | `border-radius: 0.5rem` |
| `hover:bg-gray-100` | On hover, `background-color: #f3f4f6` |

---

## 🔧 Development vs Production

| Aspect | Development (`npm run dev`) | Production (`npm run build`) |
|--------|----------------------------|------------------------------|
| Speed | Instant startup, HMR | Slow build, fast runtime |
| File size | Large (unminified) | Small (minified) |
| Source maps | Full | Minimal or none |
| Errors | Detailed | Generic |
| URL | `localhost:5173` | Your deployment URL |

---

## 📚 Key Takeaways

1. **Vite** is the build tool that makes development fast and bundles code for production
2. **vite.config.ts** configures plugins for React Router and Tailwind
3. **tsconfig.json** configures TypeScript and path aliases
4. **package.json** lists dependencies and npm scripts
5. The `build/` folder contains the production-ready files

---

## 📖 Next Steps

Continue learning with:

- **[03-REACT-ROUTER-GUIDE.md](./03-REACT-ROUTER-GUIDE.md)** - How routing works in this project
- **[04-CALENDAR-PROJECT-FILES.md](./04-CALENDAR-PROJECT-FILES.md)** - The actual calendar application code
