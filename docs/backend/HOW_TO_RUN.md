# How to Run - Backend (Spring Boot)

This guide covers how to run the Spring Boot backend application.

> **Note:** For full-stack setup including frontend and Docker, see the [root HOW_TO_RUN.md](../../HOW_TO_RUN.md).

---

## 📋 Prerequisites

### Required

- **Java 25 (JDK 25.0.2+)** - [Download here](https://jdk.java.net/25/)
  - **Full JDK required** (not JRE)
  - OpenJDK or Oracle JDK both work
  - Set `JAVA_HOME` environment variable:
    - **Windows:** `JAVA_HOME=C:\Program Files\Java\jdk-25`
    - **macOS/Linux:** `JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-25.jdk/Contents/Home`
  - Add to PATH: `%JAVA_HOME%\bin` (Windows) or `$JAVA_HOME/bin` (Linux/Mac)

- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
  - Required for PostgreSQL database
  - **Windows:** Requires WSL 2
  - Start Docker Desktop before running the backend

- **VS Code Extensions:**
  - Extension Pack for Java
  - Spring Boot Extension Pack

**Verify installation:**
```powershell
java --version          # Should show: openjdk 25.x.x
javac --version         # Should show: javac 25.x.x
echo $env:JAVA_HOME     # Should show path to JDK
docker --version        # Should show: Docker version 20.x.x or higher
```

---

## 🚀 Quick Start

### Step 1: Start the Database

From the `backend` directory, start PostgreSQL and pgAdmin:

```powershell
cd backend
docker-compose up -d postgres pgadmin
```

Verify containers are running:
```powershell
docker ps
```

You should see `smart-academic-calendar-db` and `smart-academic-calendar-pgadmin` running.

### Step 2: Run the Backend (VS Code Debugger)

1. **Open the project** in VS Code
2. **Open the Run and Debug panel** (Ctrl+Shift+D)
3. **Select "Spring Boot (Dev)"** from the dropdown
4. **Press F5** or click the green play button

The debugger will:
- Start the Spring Boot application with the `dev` profile
- Connect to PostgreSQL on `localhost:5432`
- Run Flyway migrations automatically
- Start the server on **http://localhost:8080**

### Step 3: Verify the Backend is Running

```powershell
curl http://localhost:8080/api/users
```

Expected response:
```json
[{"id":1,"username":"admin","email":"admin@example.com","createdAt":"..."}]
```

---

## 🔧 VS Code Launch Configuration

The project includes a pre-configured `launch.json` for debugging:

**File:** `.vscode/launch.json`

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "java",
            "name": "Spring Boot (Dev)",
            "request": "launch",
            "mainClass": "com.sap.smart_academic_calendar.Init",
            "vmArgs": "-Dspring.profiles.active=dev",
            "env": {
                "DATASOURCE_URL": "jdbc:postgresql://localhost:5432/appdb",
                "DATASOURCE_DRIVER": "org.postgresql.Driver",
                "DATASOURCE_USERNAME": "appuser",
                "DATASOURCE_PASSWORD": "apppass",
                "SPRING_JPA_SHOW_SQL": "true"
            }
        }
    ]
}
```

**What this does:**
- Sets the active profile to `dev` (uses PostgreSQL + Flyway)
- Configures database connection via environment variables
- Enables SQL logging for debugging
- Configures JWT tokens for authentication
- Configures WebAuthn/Passkeys for passwordless login
- Configures Resend API for email verification

### 📧 Email Verification Setup (Resend API)

The application uses [Resend](https://resend.com) to send email verification codes during user registration.

**Important:** Without a Resend API key, email verification will log verification codes to the console instead of sending real emails.

#### Getting a Resend API Key

1. **Sign up for Resend** (free tier available):
   - Visit: https://resend.com
   - Create an account (GitHub login available)
   - Free tier includes: 100 emails/day, 3,000 emails/month

2. **Create an API key:**
   - Go to: https://resend.com/api-keys
   - Click **"Create API Key"**
   - Name: `Smart Academic Calendar Dev`
   - Permission: **Full Access** (for sending emails)
   - Copy the key (starts with `re_`)

3. **Verify a sender domain (optional but recommended):**
   - Go to: https://resend.com/domains
   - Add your domain and verify DNS records
   - Or use Resend's test domain: `onboarding@resend.dev`

4. **Add API key to VS Code launch configuration:**
   - Open `.vscode/launch.json`
   - Replace `RESEND_API_KEY` value: `"re_YourApiKeyHere"`
   - Update `EMAIL_FROM` if using custom domain

**Example configuration:**
```json
"env": {
    "RESEND_API_KEY": "re_abc123def456...",
    "EMAIL_FROM": "noreply@yourdomain.com"
}
```

#### Testing Email Verification

**With Resend API key:**
```powershell
# Register a new user
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","email":"test@example.com","password":"pass123","firstName":"Test","lastName":"User"}'

# Check your email for the 6-digit verification code
# Then verify:
curl -X POST http://localhost:8080/api/auth/verify-email `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","code":"123456"}'
```

**Without Resend API key (console logging):**
- Verification codes are logged to console: `[EmailService] Verification code for user@example.com: 123456`
- Useful for development/testing without configuring Resend
- Set `app.mail.send-real-emails=false` in `application-local.properties`

#### Troubleshooting Email

**Emails not sending:**
1. Check API key is valid: `echo $env:RESEND_API_KEY`
2. Check sender domain is verified in Resend dashboard
3. Check backend logs for Resend errors
4. Verify you haven't exceeded rate limits (100/day on free tier)

**Emails going to spam:**
1. Verify your domain in Resend (adds SPF/DKIM records)
2. Use a real domain (not Gmail/Outlook addresses)
3. Add "no-reply" or similar sender name

---

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

## 📦 Building the Project

To compile and build the JAR file:

```powershell
cd backend
./mvnw clean install
```

This creates: `target/smart-academic-calendar-0.0.1-SNAPSHOT.jar`

---

## 🛑 Stopping Services

### Stop the Backend
- Press **Shift+F5** in VS Code, or
- Click the red stop button in the debug toolbar

### Stop the Database

```powershell
cd backend
docker-compose down          # Stops containers, preserves data
docker-compose down -v       # Stops containers AND deletes data
```

---

## 🧪 Testing Endpoints

### Get All Users
```powershell
curl http://localhost:8080/api/users
```

### Get User by ID
```powershell
curl http://localhost:8080/api/users/1
```

### Create New User
```powershell
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -d '{"username": "johndoe", "email": "johndoe@example.com", "password": "securePassword123"}'
```

---

## 🔍 Troubleshooting

### Database Connection Failed

**Error:** `Connection refused` or `Unable to acquire JDBC Connection`

**Solutions:**
1. Ensure Docker Desktop is running
2. Start the database: `docker-compose up -d postgres`
3. Check container status: `docker ps`
4. View logs: `docker-compose logs postgres`

### Port 8080 Already in Use

```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Flyway Migration Errors

**Error:** `Migration checksum mismatch`

**Solution:** Reset the database:
```powershell
docker-compose down -v
docker-compose up -d postgres pgadmin
```

### Java Version Issues

**Error:** `Unsupported class file major version`

**Solution:** Ensure JAVA_HOME points to JDK 25:
```powershell
echo $env:JAVA_HOME
java --version
```

---

## 📚 Additional Resources

- [DATABASE.md](DATABASE.md) - Detailed database setup and Flyway guide
- [FLYWAY_TROUBLESHOOTING.md](FLYWAY_TROUBLESHOOTING.md) - **⚠️ If Flyway isn't running, start here!**
- [CREATING_ENDPOINTS.md](CREATING_ENDPOINTS.md) - How to add new REST endpoints
- [SPRING_BOOT_BASICS.md](SPRING_BOOT_BASICS.md) - Spring Boot concepts for beginners