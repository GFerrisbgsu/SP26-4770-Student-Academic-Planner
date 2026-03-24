# Manual Testing Guide - Session Management System

**Version**: 1.1  
**Date**: February 15, 2026  
**Environment**: Docker (Frontend: http://localhost:3000, Backend: http://localhost:8080)

---

## ⚠️ Important Note

**Version 1.1 Update**: Fixed a critical bug where token refresh was failing with 401 errors. The `JwtAuthenticationFilter` has been updated to skip validation for `/api/auth/**` endpoints (including `/api/auth/refresh`). **You must rebuild Docker containers** after pulling this fix:

```powershell
docker-compose down
docker-compose up --build
```

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Test Scenarios](#test-scenarios)
   - [Basic Authentication](#1-basic-authentication)
   - [Cookie Verification](#2-cookie-verification)
   - [Token Refresh Mechanism](#3-token-refresh-mechanism)
   - [Remember Me Functionality](#4-remember-me-functionality)
   - [Inactivity Timeout](#5-inactivity-timeout)
   - [Logout Functionality](#6-logout-functionality)
   - [Protected Routes](#7-protected-routes)
   - [Token Blacklist](#8-token-blacklist)
4. [Advanced Testing](#advanced-testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker Desktop installed and running
- Browser with DevTools (Chrome, Edge, or Firefox recommended)
- Terminal/PowerShell access
- Text editor for modifying configuration files

---

## Environment Setup

### 1. Start Docker Environment

```powershell
# Navigate to project root
cd C:\CodingProjects\SE4770\sp26-4770-student-academic-planner

# Build and start containers
docker-compose up --build
```

**Expected Output**:
- Frontend container builds successfully
- Backend container builds successfully
- PostgreSQL database container starts
- No build errors

**Verify Services**:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api/users (should return JSON array)
- Backend Health: http://localhost:8080/actuator/health (if actuator enabled)

### 2. Verify Database Migration

Check that Flyway migrations have run:

```powershell
# View backend logs
docker logs sp26-4770-student-academic-planner-backend-1

# Look for:
# "Flyway: Successfully applied 4 migrations"
# "Migrating schema ... to version 4 - create token blacklist"
```

### 3. Default Test User

The system seeds an admin user via migration `V2__admin.sql`:

- **Username**: `admin`
- **Password**: `admin123`

---

## Test Scenarios

## 1. Basic Authentication

### Test 1.1: Successful Login (Without Remember Me)

**Steps**:
1. Navigate to http://localhost:3000
2. If not redirected, go to http://localhost:3000/login
3. Verify login form displays with:
   - Username field
   - Password field
   - Remember me checkbox (unchecked by default)
   - Login button
   - Sign up link
4. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
5. Keep "Remember me" **unchecked**
6. Click "Login"

**Expected Results**:
- ✅ No errors displayed
- ✅ Redirected to home page (/)
- ✅ Navbar shows user initials "AD" (from "admin")
- ✅ Navbar shows username "admin"
- ✅ Logout button visible in navbar

**Pass Criteria**: Successfully logged in and redirected to home page.

---

### Test 1.2: Failed Login (Invalid Credentials)

**Steps**:
1. Navigate to http://localhost:3000/login
2. Enter invalid credentials:
   - Username: `wronguser`
   - Password: `wrongpass`
3. Click "Login"

**Expected Results**:
- ❌ Error message displayed: "Invalid username or password"
- ❌ Still on login page
- ❌ Form fields cleared or remain editable

**Pass Criteria**: Error message displays and user remains on login page.

---

### Test 1.3: Login with Empty Fields

**Steps**:
1. Navigate to http://localhost:3000/login
2. Leave username and/or password empty
3. Click "Login"

**Expected Results**:
- ❌ Error message: "Username is required" or "Password is required"
- ❌ Form validation prevents submission

**Pass Criteria**: Proper validation error messages displayed.

---

## 2. Cookie Verification

### Test 2.1: Verify HttpOnly Cookies Set After Login

**Steps**:
1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Navigate to http://localhost:3000/login
4. Login with `admin` / `admin123` (remember me **unchecked**)
5. After successful login, check **Cookies** → http://localhost:3000

**Expected Cookies**:

| Cookie Name | Value | HttpOnly | Secure | SameSite | Max-Age |
|-------------|-------|----------|--------|----------|---------|
| `accessToken` | JWT string | ✅ Yes | ⚠️ Depends on profile | Strict | ~900 seconds (15 min) |
| `refreshToken` | JWT string | ✅ Yes | ⚠️ Depends on profile | Strict | ~604800 seconds (7 days) |

**Verification**:
- ✅ Both cookies exist
- ✅ HttpOnly flag is **checked** (prevents JavaScript access)
- ✅ SameSite is `Strict` (prevents CSRF)
- ✅ Secure flag might be unchecked (since localhost is HTTP, not HTTPS)
- ✅ `accessToken` expires in ~15 minutes
- ✅ `refreshToken` expires in ~7 days

**Pass Criteria**: Both cookies exist with correct security flags.

---

### Test 2.2: Attempt to Access Cookies via JavaScript (Should Fail)

**Steps**:
1. While logged in, open browser DevTools Console
2. Try to read cookies:
   ```javascript
   document.cookie
   ```

**Expected Results**:
- ❌ `accessToken` and `refreshToken` **NOT visible** in output
- ✅ Only non-HttpOnly cookies visible (if any)

**Pass Criteria**: HttpOnly cookies are inaccessible to JavaScript.

---

## 3. Token Refresh Mechanism

### Test 3.1: Automatic Token Refresh (Real-Time - 15 minutes)

**⚠️ Note**: This test takes 13+ minutes. Use Test 3.2 for faster testing.

**Steps**:
1. Login to the application
2. Open browser DevTools Console (F12 → Console)
3. Leave the application open and active
4. Watch console logs for token refresh activity

**Expected Console Logs**:

```
[TokenRefresh] Setting up refresh timer - will refresh every 13 minutes
[TokenRefresh] Token refreshed successfully (at ~13 minute mark)
```

**Expected Results at 13 Minutes**:
- ✅ Console logs show successful token refresh
- ✅ In DevTools → Application → Cookies:
  - `accessToken` value changes (new token issued)
  - `refreshToken` value changes (rotate on refresh)
  - Both cookies have new expiration times

**Pass Criteria**: Token automatically refreshes at 13-minute mark silently in the background.

---

### Test 3.2: Fast Token Refresh Testing (Adjusted Timeouts)

**⚠️ Recommended Method**: Modify backend for faster testing.

**Backend Configuration Changes**:

1. **Stop Docker containers**:
   ```powershell
   docker-compose down
   ```

2. **Edit Backend Properties**:  
   Open `backend/src/main/resources/application-docker.properties`

   ```properties
   # Original values:
   # jwt.access-expiration-minutes=15
   # jwt.refresh-expiration-days=7
   
   # Change to (for testing):
   jwt.access-expiration-minutes=3
   jwt.refresh-expiration-days=7
   ```

3. **Frontend Hook Update**:  
   Open `frontend/app/hooks/useTokenRefresh.ts`

   Around line 20-22, change:
   ```typescript
   // Original:
   const ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes
   
   // Change to (for testing):
   const ACCESS_TOKEN_LIFETIME_MS = 3 * 60 * 1000; // 3 minutes
   ```

4. **Rebuild and Start**:
   ```powershell
   docker-compose up --build
   ```

**Testing Steps**:
1. Login to application
2. Open browser console
3. Wait **1 minute** (3 min token - 2 min buffer = 1 min refresh)

**Expected Results at 1 Minute**:
- ✅ Console log: `[TokenRefresh] Auto-refreshing token`
- ✅ Console log: `[TokenRefresh] Token refreshed successfully`
- ✅ Cookies updated in DevTools

**Pass Criteria**: Token refreshes after 1 minute with modified settings silently without user interruption.

**⚠️ Important**: **Revert changes** after testing:
- Set `jwt.access-expiration-minutes=15` in backend
- Set `ACCESS_TOKEN_LIFETIME_MS = 15 * 60 * 1000` in frontend
- Rebuild: `docker-compose up --build`

---

## 4. Remember Me Functionality

### Test 4.1: Login WITH Remember Me Checked

**Steps**:
1. Logout if currently logged in
2. Navigate to http://localhost:3000/login
3. Enter credentials: `admin` / `admin123`
4. **Check** the "Remember me for 30 days" checkbox
5. Click "Login"
6. Open DevTools → Application → Cookies → http://localhost:3000

**Expected Results**:
- ✅ `accessToken` Max-Age: ~900 seconds (15 min) - **same as before**
- ✅ `refreshToken` Max-Age: ~2,592,000 seconds (30 days) - **extended from 7 days**

**Calculation**: 30 days = 30 × 24 × 60 × 60 = 2,592,000 seconds

**Pass Criteria**: `refreshToken` expires in 30 days when Remember Me is checked.

---

### Test 4.2: Login WITHOUT Remember Me Checked

**Steps**:
1. Logout if currently logged in
2. Navigate to http://localhost:3000/login
3. Enter credentials: `admin` / `admin123`
4. **Uncheck** the "Remember me" checkbox (default state)
5. Click "Login"
6. Open DevTools → Application → Cookies

**Expected Results**:
- ✅ `accessToken` Max-Age: ~900 seconds (15 min)
- ✅ `refreshToken` Max-Age: ~604,800 seconds (7 days)

**Calculation**: 7 days = 7 × 24 × 60 × 60 = 604,800 seconds

**Pass Criteria**: `refreshToken` expires in 7 days when Remember Me is unchecked.

---

## 5. Inactivity Timeout

### Test 5.1: 30-Minute Inactivity Timeout (Real-Time)

**⚠️ Note**: This test takes 30+ minutes. Use Test 5.2 for faster testing.

**Steps**:
1. Login to the application
2. Open browser console (DevTools → Console)
3. **Do NOT interact** with the page (no mouse, keyboard, scroll, clicks)
4. Monitor console logs every 5-10 minutes

**Expected Console Logs**:

```
[ActivityTracker] Starting activity tracking
[ActivityTracker] 29 minutes until inactivity timeout (at 1 min mark)
[ActivityTracker] 28 minutes until inactivity timeout (at 2 min mark)
...
[ActivityTracker] 1 minute until inactivity timeout (at 29 min mark)
[ActivityTracker] Inactivity timeout reached - logging out (at 30 min mark)
[SessionManager] Session expired - logging out
```

**Expected Results at 30 Minutes**:
- ✅ Automatically logged out
- ✅ Redirected to `/login?expired=true`
- ✅ Login page shows (optional: could show "Session expired" message based on URL param)
- ✅ Cookies cleared
- ✅ localStorage `currentUser` removed

**Pass Criteria**: User automatically logged out after 30 minutes of inactivity.

---

### Test 5.2: Activity Resets Timeout

**Steps**:
1. Login to the application
2. Open browser console
3. Wait 10 minutes without activity
4. Move mouse or type on keyboard
5. Wait another 10 minutes without activity
6. Check console logs

**Expected Results**:
- ✅ First 10 minutes: countdown progresses
- ✅ After activity: console logs `[ActivityTracker] Activity detected`
- ✅ Next 10 minutes: countdown **resets** and starts from 30 minutes again
- ✅ User remains logged in

**Pass Criteria**: Activity resets the inactivity timer.

---

### Test 5.3: Fast Inactivity Testing (Adjusted Timeout)

**Frontend Hook Update**:

Open `frontend/app/hooks/useActivityTracker.ts`, around line 18:

```typescript
// Original:
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Change to (for testing):
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
```

**Rebuild**:
```powershell
docker-compose down
docker-compose up --build
```

**Testing Steps**:
1. Login to application
2. Open browser console
3. **Do NOT interact** with the page
4. Wait **2 minutes**

**Expected Results at 2 Minutes**:
- ✅ Console log: `[ActivityTracker] Inactivity timeout reached - logging out`
- ✅ Automatically logged out
- ✅ Redirected to login page

**Pass Criteria**: Auto-logout after 2 minutes with modified setting.

**⚠️ Important**: **Revert changes** after testing:
- Set `INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000` in useActivityTracker.ts
- Rebuild: `docker-compose up --build`

---

## 6. Logout Functionality

### Test 6.1: Manual Logout via Navbar

**Steps**:
1. Login to application
2. Locate logout button in navbar
3. Click "Logout" button
4. Open DevTools → Application → Cookies

**Expected Results**:
- ✅ Immediately redirected to `/login` page
- ✅ All auth cookies cleared:
  - `accessToken` removed
  - `refreshToken` removed
- ✅ localStorage `currentUser` removed
- ✅ Browser console may show: `[Auth] User logged out`

**Pass Criteria**: User successfully logged out with cookies cleared.

---

### Test 6.2: Logout Blacklists Token

**Steps**:
1. Login to application
2. Open DevTools → Application → Cookies
3. Copy the `refreshToken` value
4. Click "Logout" button
5. Open a REST client (Postman, Insomnia, or use curl)
6. Try to use the copied refresh token:

```powershell
# PowerShell
$uri = "http://localhost:8080/api/auth/refresh"
$headers = @{ "Cookie" = "refreshToken=YOUR_COPIED_TOKEN" }
Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
```

**Expected Results**:
- ❌ API returns 401 Unauthorized
- ✅ Response body indicates invalid/blacklisted token
- ✅ Backend logs show token rejected

**Pass Criteria**: Logged out token is blacklisted and cannot be reused.

---

## 7. Protected Routes

### Test 7.1: Access Protected Route Without Login

**Steps**:
1. Ensure you are **logged out** (clear cookies if needed)
2. Try to access a protected route directly:
   - http://localhost:3000/
   - http://localhost:3000/courses
   - http://localhost:3000/profile

**Expected Results**:
- ✅ Automatically redirected to `/login`
- ✅ Cannot access protected pages without authentication

**Pass Criteria**: Unauthenticated users redirected to login page.

---

### Test 7.2: Access Login Page While Already Logged In

**Steps**:
1. Login to application
2. Navigate to http://localhost:3000/login directly (type in URL bar)

**Expected Results**:
- ✅ Automatically redirected to home page (/) or dashboard
- ✅ Cannot access login page while authenticated

**Pass Criteria**: Authenticated users redirected away from login page.

---

## 8. Token Blacklist

### Test 8.1: Verify Blacklisted Token Cannot Be Used

**Steps**:
1. Login to application
2. Open DevTools → Application → Cookies
3. Copy the `refreshToken` value
4. Logout (token should be blacklisted)
5. Manually set the cookie back (DevTools → Application → Cookies → Add)
6. Try to refresh the token:
   - Open DevTools → Network tab
   - Navigate to a page or wait for auto-refresh

**Expected Results**:
- ❌ Token refresh fails
- ❌ API returns 401 Unauthorized
- ❌ User logged out again
- ✅ Console log: `[TokenRefresh] Token refresh failed - logging out`

**Pass Criteria**: Blacklisted token cannot be reused.

---

### Test 8.2: Verify Token Cleanup Scheduler

**Backend Logs**:

The backend runs a daily cleanup job at **3:00 AM** to remove expired tokens from the blacklist.

**Manual Trigger** (for testing):

You can manually trigger the cleanup by temporarily modifying the cron expression:

1. **Stop Docker**:
   ```powershell
   docker-compose down
   ```

2. **Edit Backend Scheduler**:  
   Open `backend/src/main/java/com/sap/smart_academic_calendar/scheduler/TokenCleanupScheduler.java`
   
   Change cron expression (line ~14):
   ```java
   // Original: Daily at 3:00 AM
   @Scheduled(cron = "0 0 3 * * *")
   
   // Change to: Every minute (for testing)
   @Scheduled(cron = "0 * * * * *")
   ```

3. **Rebuild and Start**:
   ```powershell
   docker-compose up --build
   ```

4. **Monitor Logs**:
   ```powershell
   docker logs -f sp26-4770-student-academic-planner-backend-1
   ```

**Expected Logs** (every minute):
```
[TokenCleanupScheduler] Running token blacklist cleanup
[TokenCleanupScheduler] Deleted 3 expired tokens from blacklist
```

**Pass Criteria**: Cleanup scheduler runs and removes expired tokens.

**⚠️ Important**: **Revert cron expression** back to `"0 0 3 * * *"` after testing.

---

## Advanced Testing

### A1. Concurrent Login Sessions

**Scenario**: User logs in from multiple browsers/devices.

**Steps**:
1. Login to application in Browser 1 (Chrome)
2. Login to same account in Browser 2 (Firefox or Chrome Incognito)
3. Perform actions in both browsers

**Expected Results**:
- ✅ Both sessions remain active
- ✅ Each browser has independent cookies
- ✅ Logout in Browser 1 does NOT affect Browser 2

**Pass Criteria**: Multiple sessions work independently.

---

### A2. Token Refresh During Network Outage

**Steps**:
1. Login to application
2. Open DevTools → Network tab → Filter: "refresh"
3. Enable **Throttling** → **Offline** (simulates network failure)
4. Wait for token refresh attempt (13 minutes or use fast testing setup)

**Expected Results**:
- ❌ Token refresh fails due to network error
- ✅ Console error: `[TokenRefresh] Error refreshing token`
- ✅ User logged out after failed refresh
- ✅ Redirected to `/login?expired=true`

**Pass Criteria**: Gracefully handles network failures during token refresh.

---

### A3. Expired Refresh Token (After 7/30 Days)

**⚠️ Note**: Cannot easily test in real-time. Use mocked expired token or database manipulation.

**Alternative Testing Method**:

1. **Manually Expire Token in Database**:
   ```sql
   -- Access database
   docker exec -it smart-academic-calendar-db psql -U appuser -d appdb
   
   -- Add current refresh token to blacklist (simulates expiration)
   -- Find token from browser cookies and insert:
   INSERT INTO token_blacklist (token, user_id, expiry_date, blacklisted_at)
   VALUES ('your_refresh_token_here', 1, NOW(), NOW());
   ```

2. **Attempt to Use Application**:
   - Try to navigate pages
   - Wait for auto-refresh

**Expected Results**:
- ❌ Token refresh fails (token blacklisted)
- ✅ User logged out
- ✅ Redirected to login page

**Pass Criteria**: Expired/blacklisted tokens force re-login.

---

## Troubleshooting

### Issue: Token Refresh Fails with 401 Unauthorized

**Symptoms**: 
- Console shows: `POST http://localhost:8080/api/auth/refresh net::ERR_ABORTED 401 (Unauthorized)`
- Console shows: `[TokenRefresh] Token refresh failed - logging out`
- User automatically logged out when access token expires

**Root Cause**: The `JwtAuthenticationFilter` was validating the expired access token before the `/api/auth/refresh` endpoint could execute. Since the access token was invalid/expired, it returned 401 before the refresh token could be used.

**Solution**: 
- Modified `JwtAuthenticationFilter` to skip JWT validation **only** for public auth endpoints: `/api/auth/login`, `/api/auth/refresh`, and `/api/auth/logout`
- `/api/auth/me` still requires valid access token (protected endpoint)
- Updated `SecurityConfig` to properly distinguish between public and protected auth endpoints

**Fixed in**: Commit after initial testing session.

---

### Issue: GET /api/auth/me Returns 401 After Login

**Symptoms**: 
- Login succeeds but then immediately fails with: `GET http://localhost:8080/api/auth/me net::ERR_ABORTED 401 (Unauthorized)`
- Error in console: `Error getting current user: Error: Failed to get current user`
- Cannot access application after successful login

**Root Cause**: If JWT filter is configured to skip ALL `/api/auth/**` endpoints, the `/api/auth/me` endpoint won't have authentication context set, causing it to fail.

**Solution**: Only skip JWT validation for truly public endpoints (`/login`, `/refresh`, `/logout`). The `/api/auth/me` endpoint requires a valid access token.

**Fixed in**: Same commit as token refresh fix above.

---

### Issue: Cookies Not Set After Login

**Possible Causes**:
- CORS configuration issue
- Backend not setting cookies correctly
- Browser blocking third-party cookies

**Debugging Steps**:
1. Check browser console for CORS errors
2. Open DevTools → Network → Find `POST /api/auth/login`
3. Check Response Headers for `Set-Cookie`
4. Verify `credentials: 'include'` in frontend fetch calls

**Solution**:
- Ensure backend `CorsConfig.java` allows credentials
- Ensure `application-docker.properties` has correct settings

---

### Issue: Token Refresh Loop

**Symptoms**: Console shows repeated refresh attempts.

**Possible Causes**:
- Backend returning 401 even with valid token
- Cookie not being sent to backend
- JwtAuthenticationFilter issue

**Debugging Steps**:
1. Check DevTools → Network → Headers for outgoing requests
2. Verify `Cookie: accessToken=...` header present
3. Check backend logs for JWT validation errors

---

### Issue: Inactivity Timeout Not Working

**Possible Causes**:
- Event listeners not attached
- `useActivityTracker` hook not running

**Debugging Steps**:
1. Check console logs for `[ActivityTracker] Starting activity tracking`
2. Verify `SessionManager` component includes `useActivityTracker`
3. Test moving mouse - should log activity

---

## Summary Checklist

Use this checklist to track completed tests:

### Basic Functionality
- [ ] Test 1.1: Successful login without remember me
- [ ] Test 1.2: Failed login with invalid credentials
- [ ] Test 1.3: Login with empty fields

### Cookies
- [ ] Test 2.1: Verify HttpOnly cookies set
- [ ] Test 2.2: Cookies inaccessible via JavaScript

### Token Refresh
- [ ] Test 3.1 OR 3.2: Automatic token refresh works
- [ ] Verify cookies updated after refresh

### Remember Me
- [ ] Test 4.1: Refresh token expires in 30 days with remember me
- [ ] Test 4.2: Refresh token expires in 7 days without remember me

### Inactivity
- [ ] Test 5.1 OR 5.3: Inactivity timeout triggers logout
- [ ] Test 5.2: Activity resets the timer

### Logout
- [ ] Test 6.1: Manual logout via navbar
- [ ] Test 6.2: Logout clears cookies and blacklists token

### Protected Routes
- [ ] Test 7.1: Cannot access protected routes without login
- [ ] Test 7.2: Cannot access login page while authenticated

### Token Blacklist
- [ ] Test 8.1: Blacklisted token cannot be reused
- [ ] Test 8.2: Cleanup scheduler runs (optional)

---

## Notes

- **Backend URL**: http://localhost:8080/api
- **Frontend URL**: http://localhost:3000
- **Database**: PostgreSQL on port 5432 (internal Docker network)
- **Test User**: admin / admin123

**Important**: Always revert any configuration changes made for accelerated testing before deploying to production or committing changes!

---

**End of Manual Testing Guide**
