# Student Academic Planner

A full-stack web application for students to manage their academic calendar, courses, and degree progress.

## 🚨 Important: Flyway Database Migrations

**If database tables are missing or Flyway isn't running:**

👉 **[Read this quick fix guide](docs/backend/FLYWAY_QUICK_FIX.md)** 👈

**Most common issue:** Using the wrong Spring Boot profile
- ✅ Use `dev` profile for local development
- ✅ Use `docker` profile for Docker Compose
- ❌ Avoid `local` profile (Flyway disabled)

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, React Router 7, Vite, Tailwind CSS 4, Radix UI |
| **Backend** | Spring Boot 4.0.2, Java 25, Spring Data JPA |
| **Database** | PostgreSQL 16, Flyway migrations |
| **DevOps** | Docker, Docker Compose |

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd smart-academic-planner

# Start all services (frontend, backend, database)
docker-compose up --build

# Or use npm script
npm run docker:up
```

**Access:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **pgAdmin:** http://localhost:5050 (admin@example.com / admin)

## Project Structure

```
smart-academic-planner/
├── frontend/                    # React + Vite frontend
│   ├── app/                     # React components, routes, services
│   ├── docs/                    # Frontend documentation
│   ├── Dockerfile               # Frontend container build
│   └── package.json             # Frontend dependencies
├── backend/                     # Spring Boot backend
│   ├── src/main/java/           # Java source code
│   ├── src/main/resources/      # Configuration & migrations
│   ├── docs/                    # Backend documentation
│   ├── Dockerfile               # Backend container build
│   └── pom.xml                  # Maven dependencies
├── docker-compose.yml           # Full-stack orchestration
├── package.json                 # Monorepo scripts
├── .env.example                 # Environment variable template
└── HOW_TO_RUN.md               # Detailed run instructions
```

## Documentation

| Document | Description |
|----------|-------------|
| [HOW_TO_RUN.md](HOW_TO_RUN.md) | Complete setup and run instructions |
| [Frontend Docs](frontend/docs/) | React, Vite, and component guides |
| [Backend Docs](backend/docs/) | Spring Boot, API, and database guides |

## Available Scripts

Run from the root directory:

```bash
# Development
npm run dev:frontend      # Start frontend dev server (port 5173)
npm run dev:backend       # Start backend (requires DB)
npm run dev:backend:local # Start backend with H2 in-memory DB

# Docker
npm run docker:up         # Start all services
npm run docker:down       # Stop all services
npm run docker:db         # Start database only

# Testing
npm run test:frontend     # Run frontend tests
npm run test:backend      # Run backend tests
npm run test:all          # Run all tests

# Build
npm run build:frontend    # Build frontend for production
npm run build:backend     # Build backend JAR
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=apppass
VITE_API_URL=http://localhost:8080/api
```

## Features

- 📅 Interactive calendar with event management
- 📚 Course catalog and schedule planning
- 🎓 Degree progress tracking
- 💰 Budget planner
- ⏰ Time blocking and study scheduling

## Contact

**Project Email:** studentacademicplanner@gmail.com

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: description"`
4. Push and create PR

## License

ISC
