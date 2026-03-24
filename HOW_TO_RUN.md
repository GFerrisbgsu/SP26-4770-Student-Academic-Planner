# How to Run - Student Academic Planner

This monorepo contains both the **frontend** (React + Vite) and **backend** (Spring Boot) applications for the Student Academic Planner.

---

run 
```bash
npm install
```

## Prerequisites

### For Quick Start with Docker (Recommended)

**Required:**
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
  - Includes Docker Engine and Docker Compose
  - Minimum version: Docker 20.10+, Docker Compose 2.0+
  - **Windows:** Requires WSL 2 (Windows Subsystem for Linux)
    - Install WSL 2: `wsl --install` (run as Administrator)
    - Restart computer after WSL installation
    - Then install Docker Desktop
  - **macOS:** Native support (no additional setup)
  - **Linux:** Install Docker Engine + Docker Compose separately
  - After installation, **start Docker Desktop before running commands**
  - Verify Docker is running (icon in system tray should be green)

**Verify installation:**
```bash
docker --version          # Should show: Docker version 20.10.x or higher
docker-compose --version  # Should show: Docker Compose version 2.x.x or higher
```

### For Local Frontend Development

**Required:**
- **Node.js v20 or higher** - [Download here](https://nodejs.org/)
  - Includes npm (Node Package Manager)
  - Recommended: Install LTS (Long Term Support) version
  - **Windows:** Use installer from nodejs.org
  - **macOS:** Use installer or `brew install node`
  
**Verify installation:**
```bash
node --version   # Should show: v20.x.x or higher
npm --version    # Should show: 10.x.x or higher
```

### For Local Backend Development

**Required:**
- **Java 25 (JDK 25.0.2+)** - [Download here](https://jdk.java.net/25/)
  - Full JDK required (not just JRE)
  - Set `JAVA_HOME` environment variable after installation
  - **Windows:** Add to PATH: `C:\Program Files\Java\jdk-25\bin`
  - **macOS:** Add to PATH: `/Library/Java/JavaVirtualMachines/jdk-25.jdk/Contents/Home`

- **Maven** - [Download here](https://maven.apache.org/download.cgi) (Optional)
  - Project includes Maven Wrapper (`./mvnw`), so Maven installation is optional
  - If not installed, use `./mvnw` (Linux/Mac) or `.\mvnw.cmd` (Windows)

**Verify installation:**
```bash
java --version   # Should show: java 25.x.x
echo $JAVA_HOME  # Should show path to JDK installation
mvn --version    # (Optional) Should show: Apache Maven 3.9.x
```

## 🐳 Run: Docker Compose (Local Development)

Run the **entire application** (frontend, backend, database) locally with Docker containers.

### Prerequisites
- ✅ **Docker Desktop** installed and running
- ✅ No Java or Node.js installation required!

### Directory Structure
This is a monorepo containing both frontend and backend:
```
sp26-4770-student-academic-planner/
├── frontend/          # React + Vite application
├── backend/           # Spring Boot application  
├── docker-compose.yml # Local development
└── docker-compose.prod.yml # Production deployment
```

### Steps

1. **Ensure Docker Desktop is running** (check system tray/menu bar icon)

2. **Build and start all services** (first time takes 3-5 minutes):
   ```powershell
   docker-compose up --build
   ```
   
   **What happens:**
   - Downloads Docker images (PostgreSQL, pgAdmin, Node, Java)
   - Builds backend JAR file with `docker` profile
   - **Flyway migrations run automatically** on backend startup
   - Builds frontend production build
   - Starts all containers

3. **Verify Flyway ran successfully** - Check backend logs:
   ```powershell
   docker-compose logs backend | Select-String -Pattern "Flyway"
   ```
   
   **Expected output:**
   ```
   === Manually Creating Flyway Bean for Profile: docker ===
   Flyway Community Edition 10.x.x
   Database: jdbc:postgresql://postgres:5432/appdb
   Successfully validated 2 migrations
   Migrating schema "public" to version "1 - init"
   Migrating schema "public" to version "2 - admin"
   Successfully applied 2 migrations to schema "public", now at version v2
   ```

4. **Access the application**:

   | Service | URL | Description |
   |---------|-----|-------------|
   | Frontend | http://localhost:3000 | React application |
   | Backend API | http://localhost:8080/api | Spring Boot REST API |
   | pgAdmin | http://localhost:5050 | Database admin UI |
   | PostgreSQL | localhost:5432 | Database (direct access) |

5. **Stop all services**:
   ```powershell
   docker-compose down      # Stop containers (preserves data)
   docker-compose down -v   # Stop and delete all data
   ```

### What Docker Compose Starts
- **postgres** - PostgreSQL 16 database
- **pgadmin** - Web UI for database management
- **backend** - Spring Boot API with `docker` profile (Flyway migrations enabled)
- **frontend** - React application

**Frontend API URL:** Uses `http://localhost:8080/api`
- Browser on host machine accesses frontend at `http://localhost:3000`
- Frontend calls backend at `http://localhost:8080/api` (from browser's perspective)
- ✅ This works because both are accessible on the host machine via localhost

### ⚠️ Important: Profile Configuration

Docker Compose uses the **`docker`** profile which:
- ✅ **Enables Flyway migrations** (automatic database setup)
- ✅ Connects to PostgreSQL using Docker service name `postgres:5432`
- ✅ Runs migrations on every startup (safe - Flyway tracks applied migrations)

**Other profiles:**
- `local` - H2 in-memory database, Flyway **disabled** (for quick testing)
- `dev` - PostgreSQL on localhost:5432, Flyway **enabled** (for VS Code debugging)

### pgAdmin Login
- URL: http://localhost:5050
- Email: `admin@example.com`
- Password: `admin`

---

## 🌐 Run: Production Deployment

Deploy the full application stack to a production server.

### Prerequisites
- ✅ **Production server** with Docker and Docker Compose installed
- ✅ **Domain name** pointing to your server IP address
- ✅ **SSL certificate** (recommended - Let's Encrypt)

### Steps

1. **Create environment file on production server:**
   ```bash
   # Create .env file with production values
   cat > .env << EOF
   POSTGRES_DB=appdb
   POSTGRES_USER=appuser
   POSTGRES_PASSWORD=your_secure_random_password_here
   DOMAIN=yourdomain.com
   PGADMIN_EMAIL=admin@yourdomain.com
   PGADMIN_PASSWORD=your_secure_admin_password
   EOF
   ```

2. **Deploy production stack:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Access your application:**
   
   | Service | URL | Description |
   |---------|-----|-------------|
   | Frontend | https://yourdomain.com:3000 | React application |
   | Backend API | https://yourdomain.com:8080/api | Spring Boot REST API |
   
4. **Monitor deployment:**
   ```bash
   # Check all services are running
   docker ps
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Check specific service
   docker-compose -f docker-compose.prod.yml logs backend
   ```

5. **Stop production services:**
   ```bash
   docker-compose -f docker-compose.prod.yml down      # Stop (preserves data)
   docker-compose -f docker-compose.prod.yml down -v   # Stop and delete data
   ```

### Production Configuration

**Frontend:**
- Built with `VITE_API_URL=https://yourdomain.com/api`
- `NODE_ENV=production` (optimized build)
- Health checks enabled
- Auto-restart on failure

**Backend:**
- Uses `prod` Spring profile (`application-prod.properties`)
- HikariCP connection pooling (20 max connections)
- INFO level logging (production-appropriate)
- Performance optimizations enabled
- Health checks via `/api/users` endpoint

**Database:**
- PostgreSQL with persistent volumes
- Environment-based credentials
- Health checks enabled
- Auto-restart on failure

### Reverse Proxy Setup (Recommended)

For production, set up Nginx to handle SSL and proxy requests:

```nginx
# /etc/nginx/sites-available/yourdomain.com
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🗄️ Database Access

### pgAdmin (Web Interface)

1. Open: **http://localhost:5050**
2. Login: `admin@example.com` / `admin`
3. Add server connection:
   - **Host:** `postgres` (not localhost!)
   - **Port:** `5432`
   - **Database:** `appdb`
   - **Username:** `appuser`
   - **Password:** `apppass`

### Direct PostgreSQL Connection

For tools like DBeaver, DataGrip, or SQLTools:
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `appdb`
- **Username:** `appuser`
- **Password:** `apppass`

---

---

## 💻 Run: Separate Frontend/Backend Development

Run frontend and backend separately for development (fastest iteration).

### Prerequisites
- ✅ **Node.js v20+** and **Java 25** installed locally
- ✅ No Docker required!

### Steps

1. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start backend (Terminal 1):**
   ```bash
   cd backend
   # Uses H2 in-memory database (no PostgreSQL needed)
   ./mvnw spring-boot:run
   ```
   
   **Backend runs on:** http://localhost:8080

3. **Start frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   
   **Frontend runs on:** http://localhost:5173

### Configuration

**Frontend** uses `.env.local`:
```env
VITE_API_URL=http://localhost:8080/api
```

**Backend** uses `local` profile:
- H2 in-memory database (auto-created)
- No Docker or PostgreSQL required
- Fast startup for development

---

## Environment Variables

### Local Development (docker-compose.yml)

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | appdb | PostgreSQL database name |
| `POSTGRES_USER` | appuser | PostgreSQL username |
| `POSTGRES_PASSWORD` | apppass | PostgreSQL password |
| `PGADMIN_EMAIL` | admin@example.com | pgAdmin login email |
| `PGADMIN_PASSWORD` | admin | pgAdmin login password |
| `RESEND_API_KEY` | *(optional)* | Resend API key for email verification (leave empty to disable real emails) |
| `EMAIL_FROM` | noreply@smartacademiccalendar.com | Email sender address |

### Production Deployment (docker-compose.prod.yml)

**Required environment variables on production server:**

| Variable | Example | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | appdb | PostgreSQL database name |
| `POSTGRES_USER` | appuser | PostgreSQL username |
| `POSTGRES_PASSWORD` | SecurePass123! | **Strong password required** |
| `DOMAIN` | yourdomain.com | Your production domain name |
| `PGADMIN_EMAIL` | admin@yourdomain.com | pgAdmin login email |
| `PGADMIN_PASSWORD` | SecureAdminPass! | **Strong password required** |
| `RESEND_API_KEY` | re_YourApiKey123 | **Resend API key for email verification** |
| `EMAIL_FROM` | noreply@yourdomain.com | Email sender address (must be verified in Resend) |

## Troubleshooting
### Quick Reference - Common Startup Errors

| Error Message | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| `bind: Only one usage of each socket address` | Port 8080/3000/5432 already in use | `netstat -ano \| findstr :PORT` then `taskkill /PID <PID> /F` |
| `localhost:5173 failed to connect` | Frontend dev server not started or crashed | If using Docker: Ignore (Docker uses port 3000)<br>If local dev: `npm run dev` in frontend/ |
| `Cannot connect to Docker daemon` | Docker Desktop not running | Start Docker Desktop, wait for green icon |
| `WSL 2 installation is incomplete` | WSL 2 not installed (Windows) | `wsl --install` as Administrator, restart PC |
| `ENOENT: no such file or directory, open 'package.json'` | Wrong directory | Run commands from correct folder (monorepo root for Docker) |
| `Java version mismatch` | Wrong Java version | Install Java 25, set JAVA_HOME |
| `npm ERR! code ELIFECYCLE` | Failed build or dependency issue | `rm -rf node_modules`, `npm install`, retry |

---
### Port Already in Use (Common Issue)

If you see errors like `bind: Only one usage of each socket address is normally permitted`:

**Port 8080 (Backend):**
```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Example output:
#   TCP    0.0.0.0:8080           0.0.0.0:0              LISTENING       8688
# The number at the end (8688) is the Process ID (PID)

# Kill the process (replace 8688 with your PID)
taskkill /PID 8688 /F

# Then retry Docker
npm run docker:up
```

**Port 3000 (Frontend Docker):**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**Port 5173 (Frontend Dev Server):**
```powershell
# Find what's using port 5173
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F

# If Vite dev server crashed, also check for orphaned processes:
# Kill all node processes (WARNING: closes ALL Node.js apps)
taskkill /IM node.exe /F
```

**Port 5432 (PostgreSQL):**
```powershell
# Check if local PostgreSQL is running
netstat -ano | findstr :5432

# Stop local PostgreSQL service (if installed)
net stop postgresql-x64-14  # Adjust version number

# Or kill the process
taskkill /PID <PID> /F
```

### Docker Desktop Not Running

**Symptoms:** `Cannot connect to the Docker daemon`

**Solution:**
1. Open Docker Desktop application
2. Wait for Docker to start (check system tray icon turns green)
3. Verify: `docker --version`
4. Then run: `npm run docker:up`

### WSL 2 Not Installed (Windows Only)

**Symptoms:** Docker Desktop won't start or shows WSL 2 error

**Solution:**
```powershell
# Install WSL 2 (run as Administrator)
wsl --install

# Restart computer
# Then start Docker Desktop
```

More info: https://docs.microsoft.com/en-us/windows/wsl/install

### Docker Images Failed to Download

**Symptoms:** Timeout or network errors during image pull

**Solution:**
```bash
# Check internet connection
# Retry with clean slate
npm run docker:down:volumes
docker system prune -a  # Warning: removes ALL unused images
npm run docker:up
```

### Services Won't Start / Keep Restarting

**Check logs:**
```bash
npm run docker:logs          # All services
docker-compose logs backend  # Backend only
docker-compose logs frontend # Frontend only
docker-compose logs postgres # Database only
```

**Common solutions:**
```bash
# Remove all containers and volumes
npm run docker:down:volumes

# Rebuild from scratch
docker-compose build --no-cache
npm run docker:up

# If still failing, try:
docker system prune -a --volumes  # Warning: removes everything
npm run docker:up
```

### Frontend Can't Connect to Backend

**Symptoms:** 404 or CORS errors in browser console, "localhost:5173 failed to connect"

**Solutions:**
1. **Check if backend is running:**
   ```powershell
   curl http://localhost:8080/api/users
   # Or check in browser: http://localhost:8080/api/users
   ```

2. **Verify no port conflicts:**
   ```powershell
   # Check ports 8080, 3000, 5173
   netstat -ano | findstr "8080 3000 5173"
   # Kill any conflicting processes
   ```

3. **Check backend logs:**
   ```powershell
   docker-compose logs backend
   # Look for "Started Init in X seconds" message
   ```

4. **Verify CORS configuration:**
   - Backend must allow `http://localhost:5173` (dev server)
   - Backend must allow `http://localhost:3000` (Docker frontend)
   - Check `backend/src/main/java/com/sap/smart_academic_calendar/config/CorsConfig.java`

5. **Environment variables:**
   - Dev: `VITE_API_URL=http://localhost:8080/api` (frontend .env)
   - Docker: Automatically configured

6. **Wait for services to fully start:**
   - Backend takes 20-30 seconds to start
   - Database takes 10-15 seconds
   - Frontend builds take 30-60 seconds on first run

### Database Connection Failed

**Symptoms:** Backend logs show `Connection refused` to PostgreSQL

**Solutions:**
1. Verify PostgreSQL container is running: `docker ps | Select-String "postgres"`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Wait 10-15 seconds for database to fully start
4. Verify connection: `docker exec -it smart-academic-calendar-db psql -U appuser -d appdb`

### Flyway Not Running / Tables Missing

**Symptoms:** 
- Backend starts but tables don't exist
- No Flyway logs in backend output
- Database queries fail with "relation does not exist"

**Diagnosis:**
```powershell
# Check which profile is active
docker-compose logs backend | Select-String -Pattern "profile"

# Should show: "The following 1 profile is active: docker"
```

**Solutions:**

1. **Verify `docker` profile is active:**
   - Check `docker-compose.yml` has: `SPRING_PROFILES_ACTIVE: docker`
   - Rebuild if changed: `docker-compose up --build`

2. **Check Flyway logs:**
   ```powershell
   docker-compose logs backend | Select-String -Pattern "Flyway"
   ```
   - Should show migration messages
   - If no Flyway logs appear, profile configuration is wrong

3. **Verify migration files exist:**
   ```powershell
   # Check migration files are in the JAR
   docker-compose exec backend ls -la /app/BOOT-INF/classes/db/migration/
   ```

4. **Reset database and rebuild:**
   ```powershell
   docker-compose down -v  # Delete all data
   docker-compose up --build  # Rebuild and restart
   ```

5. **Manual verification:**
   ```powershell
   # Connect to database and check for tables
   docker exec -it smart-academic-calendar-db psql -U appuser -d appdb -c "\dt"
   
   # Should show: users, flyway_schema_history
   ```

### Java Version Issues (Local Development)

**Symptoms:** `UnsupportedClassVersionError` or version mismatch

**Solution:**
```bash
# Verify Java 25 is installed and active
java --version   # Should show 25.x.x
javac --version  # Should show 25.x.x

# Check JAVA_HOME points to JDK 25
echo $JAVA_HOME  # Linux/Mac
echo %JAVA_HOME% # Windows

# Update if needed:
# Windows: System Properties → Environment Variables
# Mac/Linux: Update .bashrc or .zshrc
```

### Node.js Version Issues

**Symptoms:** `ERR_UNSUPPORTED_NODE_VERSION` or module errors

**Solution:**
```bash
# Verify Node.js v20+ is installed
node --version   # Should show v20.x.x or higher

# If wrong version, install Node.js v20+ from:
# https://nodejs.org/

# Then reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json  # Clean install
npm install
```

### Permission Denied (Linux/Mac)

**Symptoms:** `EACCES` permission errors

**Solution:**
```bash
# Don't use sudo with npm!
# Fix npm permissions:
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Or fix ownership:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ./node_modules
```

---

## Component-Specific Documentation

- [Frontend Documentation](frontend/docs/HOW_TO_RUN.md)
- [Backend Documentation](backend/docs/HOW_TO_RUN.md)
