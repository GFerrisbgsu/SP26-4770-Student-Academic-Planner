# Database Setup and Management

## Overview

This application uses **PostgreSQL** running in Docker for the `dev` profile and **H2** in-memory database for the `local` profile. Database schema migrations are managed by **Flyway**.

---

## Understanding Docker for Beginners

### What is Docker?

**Docker** is a platform that allows you to run applications in isolated environments called **containers**. Think of containers as lightweight, portable "boxes" that contain everything an application needs to run.

**Why use Docker for databases?**
- ✅ **No installation hassle** - Don't need to install PostgreSQL directly on your computer
- ✅ **Consistent environment** - Everyone on the team uses the exact same database version
- ✅ **Easy cleanup** - Delete the container when done, no leftover files
- ✅ **Isolation** - Database runs separately from your main system
- ✅ **Quick setup** - Start a database with one command

**Real-world analogy:**
Imagine Docker containers like shipping containers. Just like shipping containers:
- They're standardized (same size/shape)
- They're portable (work anywhere)
- They're isolated (contents don't mix)
- They're easy to move (between computers/servers)

### What is Docker Desktop?

**Docker Desktop** is the application you install on Windows/Mac that:
- Runs Docker containers on your machine
- Provides a user interface to manage containers
- Includes Docker Compose for multi-container applications

**Download:** https://www.docker.com/products/docker-desktop/

### Container vs Image

**Docker Image:**
- A template/blueprint for creating containers
- Contains the application and all its dependencies
- Read-only, doesn't change
- Example: `postgres:16` image contains PostgreSQL 16 software

**Docker Container:**
- A running instance of an image
- Has its own isolated filesystem, network, and processes
- Can be started, stopped, and deleted
- Example: `smart-academic-calendar-db` container running PostgreSQL

**Analogy:**
- **Image** = Recipe for baking a cake
- **Container** = The actual cake you baked from that recipe

### What is Docker Compose?

**Docker Compose** is a tool for defining and running multi-container applications using a YAML configuration file.

**In this project:**
- We need TWO containers: PostgreSQL database + pgAdmin web interface
- Docker Compose starts/stops both containers together
- Configuration is in `docker-compose.yml` file

**Benefits:**
- Single command to start everything: `docker-compose up`
- Single command to stop everything: `docker-compose down`
- Containers can communicate with each other
- Easy to share setup with team members

### Understanding docker-compose.yml

Let's break down the `docker-compose.yml` file in this project:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: smart-academic-calendar-db
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    ports:
      - "5432:5432"
    volumes:
      - smart_calendar_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: smart-academic-calendar-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  smart_calendar_data:
```

**Line-by-line explanation:**

**`services:`**
- Defines the containers we want to run (postgres and pgadmin)

**Postgres Service:**
- `image: postgres:16` - Uses official PostgreSQL version 16 image from Docker Hub
- `container_name: smart-academic-calendar-db` - Custom name for easy identification
- `environment:` - Sets environment variables inside the container:
  - `POSTGRES_DB: appdb` - Creates a database named "appdb"
  - `POSTGRES_USER: appuser` - Creates a user named "appuser"
  - `POSTGRES_PASSWORD: apppass` - Sets password to "apppass"
- `ports: "5432:5432"` - Maps port 5432 (PostgreSQL) from container to your computer
  - Format: `"HOST_PORT:CONTAINER_PORT"`
  - Your app connects to `localhost:5432`, which routes to the container
- `volumes: smart_calendar_data:/var/lib/postgresql/data` - Persists database data
  - Data survives even if container is deleted
  - Stored in a Docker volume (managed by Docker)

**pgAdmin Service:**
- `image: dpage/pgadmin4:latest` - Uses pgAdmin 4 web interface
- `environment:` - Login credentials:
  - Email: `admin@admin.com`
  - Password: `admin`
- `ports: "5050:80"` - Web interface accessible at `http://localhost:5050`
  - pgAdmin runs on port 80 inside container
  - Your browser accesses it at port 5050
- `depends_on: - postgres` - Ensures PostgreSQL starts before pgAdmin

**`volumes:`**
- Defines named volumes for persistent data storage
- `smart_calendar_data` stores all PostgreSQL data (tables, rows, etc.)

### What is pgAdmin?

**pgAdmin** is a web-based graphical user interface (GUI) for managing PostgreSQL databases.

**What you can do with pgAdmin:**
- ✅ Browse tables and view data
- ✅ Run SQL queries
- ✅ View database schema (table structure)
- ✅ Export/import data
- ✅ Monitor database performance
- ✅ Create/modify tables visually

**Why is it running in Docker?**
- No separate installation needed
- Same pgAdmin version for everyone
- Easy to start/stop alongside database
- Automatically configured to work with the PostgreSQL container

**Alternative:** SQLTools (VS Code extension) - lighter weight, runs in your editor

### Docker Networking Explained

When containers are defined in the same `docker-compose.yml`, they can communicate using **service names** as hostnames.

**Important concept:**
- **From your computer:** Connect to PostgreSQL using `localhost:5432`
- **From pgAdmin container:** Connect to PostgreSQL using `postgres:5432`

**Why the difference?**
- Your computer and pgAdmin are in different "network spaces"
- Docker creates a private network for containers
- Service name (`postgres`) acts as hostname within that network
- `localhost` inside a container refers to THAT container, not your computer

**Practical example:**
When configuring pgAdmin to connect to PostgreSQL:
- ❌ Host: `localhost` - Won't work! (pgAdmin looks inside its own container)
- ✅ Host: `postgres` - Works! (Uses Docker network to find PostgreSQL container)

**Visual representation:**
```
┌─────────────────────────────────────────────────┐
│ Your Computer (Windows/Mac)                     │
│                                                 │
│  Spring Boot App ──→ localhost:5432             │
│  Web Browser ────→ localhost:5050               │
│                          │                      │
│  ┌─────────────────────────────────────────┐    │
│  │ Docker Network                          │    │
│  │                                         │    │
│  │  ┌──────────────┐    ┌──────────────┐   │    │
│  │  │  postgres    │←───│   pgadmin    │   │    │
│  │  │  container   │    │   container  │   │    │
│  │  │  (port 5432) │    │  (port 80)   │   │    │
│  │  └──────────────┘    └──────────────┘   │    │
│  │         ↕                               │    │
│  │  [smart_calendar_data volume]           │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Common Docker Commands

**View running containers:**
```powershell
docker ps
```

**View all containers (including stopped):**
```powershell
docker ps -a
```

**View container logs:**
```powershell
docker logs smart-academic-calendar-db
docker logs smart-academic-calendar-pgadmin
```

**Execute command inside container:**
```powershell
# Open PostgreSQL command line
docker exec -it smart-academic-calendar-db psql -U appuser -d appdb
```

**View Docker volumes:**
```powershell
docker volume ls
```

**Inspect a volume:**
```powershell
docker volume inspect sp26-4770-student-academic-planner_backend_smart_calendar_data
```

**Remove stopped containers:**
```powershell
docker container prune
```

**Remove unused volumes:**
```powershell
docker volume prune
```

---

## Docker Setup

### Docker Compose Configuration

The `docker-compose.yml` file defines two services:

1. **postgres** - PostgreSQL 16.11 database
   - Port: `5432`
   - Database: `appdb`
   - Username: `appuser`
   - Password: `apppass`
   - Data persistence: Docker volume `smart_calendar_data`

2. **pgadmin** - pgAdmin 4 web interface
   - Port: `5050` (http://localhost:5050)
   - Email: `admin@admin.com`
   - Password: `admin`

### Starting Docker Containers

```powershell
docker-compose up -d
```

### Stopping Docker Containers

```powershell
docker-compose down
```

### Checking Container Status

```powershell
docker ps
```

## Viewing the Database

### Option 1: pgAdmin (Web Interface)

pgAdmin is a powerful web-based tool for managing PostgreSQL databases. It's already running in a Docker container!

#### Accessing pgAdmin

1. **Open your web browser**
2. Navigate to: **http://localhost:5050**
3. You'll see the pgAdmin login page

#### First-Time Login

**Login credentials:**
- Email: `admin@admin.com`
- Password: `admin`

**Note:** These credentials are set in the `docker-compose.yml` file under pgAdmin's environment variables.

#### Connecting to the PostgreSQL Database

SQLTools is a lightweight alternative to pgAdmin that runs directly in VS Code. Perfect for quick queries without leaving your editor!

#### Installing SQLTools

1. **Open VS Code Extensions** (Ctrl+Shift+X or Cmd+Shift+X)
2. **Search for:** `SQLTools`
3. **Install:** "SQLTools - Database tools" by Matheus Teixeira
4. **Search for:** `SQLTools PostgreSQL`
5. **Install:** "SQLTools PostgreSQL/Cockroach Driver"

#### Creating a Connection

1. **Open SQLTools Panel:**
   - Click the SQLTools icon in the left sidebar (looks like a database)
   - Or press Ctrl+Shift+D (Windows) / Cmd+Shift+D (Mac)

2. **Add New Connection:**
   - Click the **"+"** icon at the top of SQLTools panel
   - Select **"PostgreSQL"**

3. **Fill in Connection Details:**
   - **Connection name:** `Smart Calendar - Local`
   - **Server:** `localhost` (different from pgAdmin! Your computer connects directly)
   - **Port:** `5432`
   - **Database:** `appdb`
   - **Username:** `appuser`
   - **Password:** `apppass`
   - ✅ **Save password:** Check this

4. **Test and Save:**
   - Click **"Test Connection"** to verify it works
   - Click **"Save Connection"**

#### Using SQLTools

**Connecting to Database:**
1. Click on your connection name in SQLTools panel
2. Look for "Connected" indicator

**Browsing Tables:**
- Expand your connection in SQLTools panel
- You'll see:
  - Tables (users, flyway_schema_history)
  - Views
  - Functions
  - Stored Procedures

**Running Queries:**
1. Right-click your connection → **"New SQL File"**
2. Type your SQL query:
```sql
SELECT * FROM users;
```
3. **Run query:**
   - **Option 1:** Press Ctrl+E Ctrl+E (Windows) / Cmd+E Cmd+E (Mac)
   - **Option 2:** Right-click → "Run on active connection"
   - **Option 3:** Use the play button in the top-right

**Quick Actions:**
- Right-click table → **"Show Table Records"** (quick view of all rows)
- Right-click table → **"Show Table Definition"** (view schema)
- Right-click table → **"Generate INSERT Query"** (helpful template)

#### SQLTools vs pgAdmin

**Use SQLTools when:**
- ✅ You want to stay in VS Code
- ✅ You need quick database access while coding
- ✅ You prefer a minimal interface
- ✅ You mainly run SQL queries

**Use pgAdmin when:**
- ✅ You need advanced database management
- ✅ You want visual table editors
- ✅ You need database backups/restores
- ✅ You want ER diagrams
- ✅ You're managing multiple databases

**Both tools can coexist!** Use whichever fits your workflow. uses Docker's internal network
     - The service name from `docker-compose.yml` becomes the hostname
   - **Port:** `5432` (default PostgreSQL port)
   - **Maintenance database:** `appdb` (the database name we created)
   - **Username:** `appuser`
   - **Password:** `apppass`
   - ✅ **Save password?** Check this box to avoid re-entering password

4. **Click "Save"**

#### Navigating pgAdmin

Once connected, explore the database structure:

**Left Panel Navigation:**
```
Servers
└── Smart Calendar DB
    └── Databases
        └── appdb
            └── Schemas
                └── public
                    ├── Tables
                    │   ├── flyway_schema_history (Flyway tracking table)
                    │   └── users (Your users table)
                    ├── Views
                    ├── Functions
                    └── Sequences
```

#### Viewing Table Data

**To see data in the `users` table:**
1. Expand: Servers → Smart Calendar DB → Databases → appdb → Schemas → public → Tables
2. Right-click on `users` table
3. Select **"View/Edit Data"** → **"All Rows"**
4. Data appears in a spreadsheet-like view

#### Running SQL Queries

**To execute custom SQL queries:**
1. Select the `appdb` database in the left panel
2. Click **"Tools"** menu → **"Query Tool"** (or press Alt+Shift+Q)
3. Type your SQL query:
```sql
SELECT * FROM users;
```
4. Click the **Play button** (▶️) or press F5 to execute
5. Results appear in the bottom panel

**Example queries:**
```sql
-- View all users
SELECT * FROM users;

-- Count total users
SELECT COUNT(*) FROM users;

-- Find user by username
SELECT * FROM users WHERE username = 'johndoe';

-- View Flyway migration history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

#### pgAdmin Features

**Dashboard:**
- Click on database name to see dashboard with statistics
- Shows server activity, connections, transactions

**Table Properties:**
- Right-click table → Properties
- View columns, constraints, indexes, triggers

**Export Data:**
- Right-click table → Import/Export
- Export to CSV, Excel, or other formats

**Backup/Restore:**
- Right-click database → Backup/Restore
- Create database backups

**ER Diagrams:**
- Right-click database → ERD For Database
- Visualize table relationships

#### Common pgAdmin Issues

**Issue: Can't access http://localhost:5050**
- **Solution:** 
  - Verify pgAdmin container is running: `docker ps`
  - Check if port 5050 is already in use
  - Restart containers: `docker-compose restart`

**Issue: "Unable to connect to server" when adding server**
- **Solution:**
  - Make sure you used `postgres` as hostname, NOT `localhost`
  - Verify PostgreSQL container is running: `docker ps`
  - Check credentials match those in `docker-compose.yml`

**Issue: "Login failed" on pgAdmin**
- **Solution:**
  - Use credentials: `admin@admin.com` / `admin`
  - Clear browser cache and cookies
  - Check docker-compose.yml for correct credentials

**Issue: Connection saved but can't connect**
- **Solution:**
  - Check if PostgreSQL container is healthy: `docker logs smart-academic-calendar-db`
  - Restart both containers: `docker-compose restart`

### Option 2: SQLTools (VS Code Extension)

1. Install the SQLTools extension in VS Code
2. Install the PostgreSQL driver extension
3. Create a new connection:
   - Connection name: `Smart Calendar - Local`
   - Database type: `PostgreSQL`
   - Server: `localhost`
   - Port: `5432`
   - Database: `appdb`
   - Username: `appuser`
   - Password: `apppass`
4. Save and connect
5. You can now run SQL queries directly in VS Code

## Flyway Database Migrations

### What is Flyway?

Flyway is a database migration tool that manages schema changes using versioned SQL scripts. It tracks which migrations have been applied to prevent duplicate execution.

### Migration Files

Migration files are located in: `src/main/resources/db/migration/`

**Naming Convention:** `V<version>__<description>.sql`
- ✅ Correct: `V1__init.sql`, `V2__add_courses_table.sql`
- ❌ Incorrect: `V1_init.sql` (single underscore), `v1__init.sql` (lowercase v)

**Important:** Use **DOUBLE underscores** (`__`) between version and description!

### How Flyway Works

1. On application startup (with `dev` profile), Flyway automatically runs
2. Flyway checks the `flyway_schema_history` table to see which migrations have been applied
3. Flyway runs any new migrations in version order
4. Each migration is recorded in `flyway_schema_history` with a checksum

### Current Migrations

- **V1__init.sql** - Creates the `users` table with columns:
  - `id` (BIGSERIAL PRIMARY KEY)
  - `username` (VARCHAR 255, UNIQUE, NOT NULL)
  - `email` (VARCHAR 255, UNIQUE, NOT NULL)
  - `password` (VARCHAR 255, NOT NULL)
  - `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)

### Configuration

Flyway is configured in `src/main/resources/application-dev.properties`:

```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
logging.level.org.flywaydb=DEBUG
```

### Manual Flyway Configuration

Due to Spring Boot 4.x changes, Flyway is manually configured in `src/main/java/com/sap/smart_academic_calendar/config/FlywayConfig.java`. This ensures migrations run consistently.

## Adding New Tables

### Step 1: Create a New Migration File

Create a new file in `src/main/resources/db/migration/` with the next version number:

**Example:** `V2__create_courses_table.sql`

```sql
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    credits INTEGER NOT NULL,
    grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 2: Rebuild the Project

Flyway reads migration files from the compiled classpath, so rebuild:

```powershell
./mvnw clean compile
```

### Step 3: Restart the Application

When the app starts, Flyway will detect and run the new migration.

### Step 4: Verify Migration

Check the logs for:
```
Migrating schema "public" to version "2 - create courses table"
Successfully applied 1 migration to schema "public", now at version v2
```

Or query the database:
```sql
SELECT * FROM flyway_schema_history;
```

## Modifying Existing Tables

### ⚠️ IMPORTANT: Never Modify Applied Migrations!

Once a migration has been applied (especially in shared environments or production), **NEVER** edit that migration file. Flyway tracks checksums and will fail if it detects changes.

### Best Practice: Create New Migrations

Instead of editing `V1__init.sql`, create a new migration:

**Example:** `V3__add_phone_to_users.sql`

```sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

## Resetting the Database (Development Only)

### Full Database Reset

To completely reset the database and rerun all migrations from scratch:

```powershell
# Stop the application first

# Delete the Docker volume (destroys all data)
docker-compose down
docker volume rm sp26-4770-student-academic-planner_backend_smart_calendar_data

# Restart containers (creates fresh database)
docker-compose up -d

# Restart the application (Flyway will run all migrations)
```

### Editing Migrations During Development

If you're still developing and want to modify an existing migration:

1. Stop the application
2. Delete the Docker volume (as shown above)
3. Edit the migration file (e.g., `V1__init.sql`)
4. Rebuild: `./mvnw clean compile`
5. Restart containers and application
6. Flyway will rerun all migrations with your changes

## Switching Git Branches with Different Migrations

### The Problem

When you switch branches that have different Flyway migrations:
- Branch A might have `V1`, `V2`, `V3` migrations
- Branch B might only have `V1`, `V2` migrations
- Switching from A to B, the database still remembers V3 was applied (recorded in `flyway_schema_history`)
- Spring Boot startup fails because V3 migration file no longer exists

### The Solution: Complete Clean Reset

When switching between branches with different migrations:

```powershell
# Step 1: Stop Docker containers and DELETE volumes
docker-compose down -v

# Step 2: Clean Maven build artifacts (clears cached migrations)
cd backend
./mvnw clean

# Step 3: Prune Docker system (removes dangling images/networks)
docker system prune -f

# Step 4: Restart containers fresh
docker-compose up -d

# Step 5: Rebuild the project to get current branch's migrations
./mvnw compile

# Step 6: Start the application (Flyway runs with clean history)
./mvnw spring-boot:run
```

### Why This Works

1. **`docker-compose down -v`** - Deletes the database volume completely
2. **`./mvnw clean`** - Removes compiled bytecode with old migration classpath references
3. **`docker system prune -f`** - Cleans up Docker filesystem
4. **Fresh containers** - Creates brand-new PostgreSQL with empty `flyway_schema_history`
5. **`./mvnw compile`** - Builds with current branch's migrations only
6. **Application starts fresh** - Flyway sees clean history and applies only current branch's migrations

### Key Points

- **Don't just delete volume** - Maven keeping stale migration references can cause issues
- **Must clean Docker AND Maven** - Either alone might leave stale data
- **Safe for development only** - Never do this on production databases!
- **The `-v` flag is critical** - `-v` means "delete volumes" in docker-compose

### Checking Migration History

After clean reset, verify only your branch's migrations exist:

```powershell
# Query the database to see applied migrations
docker exec smart-academic-calendar-db psql -U appuser -d appdb -c "SELECT * FROM flyway_schema_history ORDER BY installed_rank;"
```

You should see only the migrations from your current branch.

## Troubleshooting

### Flyway Not Running

**Symptoms:** No Flyway logs appear, tables aren't created

**Solutions:**
1. Verify the `dev` profile is active (check startup logs)
2. Rebuild the project: `./mvnw clean compile`
3. Check that migration files are in `target/classes/db/migration/`
4. Verify `FlywayConfig.java` exists and is loaded

### Checksum Mismatch Error

**Symptoms:** `Validate failed: Migrations have failed validation`

**Cause:** An applied migration file was modified after being executed

**Solutions:**
- **Development:** Reset the database (see "Full Database Reset")
- **Production:** Create a new migration instead of editing existing ones

### Migration File Not Detected

**Symptoms:** New migration file isn't executed

**Solutions:**
1. Check filename follows convention: `V<number>__<description>.sql` (double underscore!)
2. Rebuild the project: `./mvnw clean compile`
3. Verify file is in `src/main/resources/db/migration/`
4. Check file was copied to `target/classes/db/migration/`

### Docker Connection Errors

**Symptoms:** `Connection refused` to PostgreSQL

**Solutions:**
1. Verify Docker Desktop is running
2. Check containers: `docker ps`
3. Restart containers: `docker-compose down && docker-compose up -d`
4. Verify port 5432 isn't blocked by firewall

## Useful SQL Queries

### View All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### View Migration History
```sql
SELECT version, description, installed_on, success 
FROM flyway_schema_history 
ORDER BY installed_rank;
```

### View Users Table
```sql
SELECT * FROM users;
```

### Count Records
```sql
SELECT COUNT(*) FROM users;
```
