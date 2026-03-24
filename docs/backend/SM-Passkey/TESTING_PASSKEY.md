# Passkey Feature Testing Guide

End-to-end testing for the WebAuthn passkey feature — covers backend API, frontend UI, browser integration, and error scenarios.

---

## Environment Setup

### Start All Services (Docker)

```powershell
docker-compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| pgAdmin | http://localhost:5050 |

### Verify Everything Is Running

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}"
```

All four containers should show `healthy` or `Up`:
```
smart-academic-calendar-frontend   Up (healthy)
smart-academic-calendar-backend    Up (healthy)
smart-academic-calendar-pgadmin    Up
smart-academic-calendar-db         Up (healthy)
```

### Database Access (pgAdmin)

1. Open http://localhost:5050
2. Login: `admin@example.com` / `admin`
3. Connect: host `postgres`, port `5432`, db `appdb`, user `appuser`, password `apppass`

### Useful DB Queries

```sql
-- See all registered passkeys
SELECT id, user_id, name, credential_id, sign_count, created_at FROM passkeys;

-- See active sessions (in-progress registrations/authentications)
SELECT id, user_id, challenge, expires_at, created_at FROM passkey_sessions;

-- Check which users have passkeys enabled
SELECT id, username, passkey_enabled FROM users;
```

---

## Passkey Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/passkey/register/begin` | Required | Generate registration challenge |
| POST | `/api/auth/passkey/register/complete` | Required | Store credential after browser attestation |
| POST | `/api/auth/passkey/authenticate/begin` | Public | Generate authentication challenge |
| POST | `/api/auth/passkey/authenticate/complete` | Public | Verify assertion and issue JWT tokens |
| GET | `/api/auth/passkeys` | Required | List authenticated user's passkeys |
| DELETE | `/api/auth/passkeys/{id}` | Required | Delete a passkey by ID |

---

## Test 1: Passkey Registration Flow (Frontend)

This is the primary happy-path test. Requires a browser with WebAuthn support (Chrome, Firefox, Safari, Edge).

### Steps

1. Open http://localhost:3000
2. Login with `admin` / `admin123`
3. Navigate to the **Profile** page (top-right avatar → Profile)
4. Scroll to the **Security Settings** section
5. Click **Register New Passkey**
6. Enter a name (e.g. `Test Laptop`) in the dialog
7. Click **Register**
8. Complete the browser prompt (Windows Hello PIN, Touch ID, or platform authenticator)
9. Click **Save** when the browser asks to save the passkey

### Expected Results

- Dialog closes with a success toast: `Passkey registered successfully`
- The new passkey appears in the list under Security Settings with the name you entered and today's date
- No error messages in the browser console

### Database Verification

```sql
SELECT id, user_id, name, credential_id, created_at FROM passkeys WHERE user_id = 1;
-- Expected: one row with name = 'Test Laptop'

SELECT id, username, passkey_enabled FROM users WHERE id = 1;
-- Expected: passkey_enabled = true

SELECT * FROM passkey_sessions WHERE user_id = 1;
-- Expected: no rows (session cleaned up after completion)
```

---

## Test 2: Passkey Login Flow (Frontend)

Tests the full passwordless authentication path.

### Prerequisites

- Complete Test 1 (at least one passkey registered)

### Steps

1. Click **Logout** in the profile menu
2. On the login page, click **Sign in with Passkey** (below the password form)
3. The browser prompts you to select a passkey — choose the one registered in Test 1
4. Authenticate with your platform authenticator (PIN, Touch ID, etc.)

### Expected Results

- Automatic redirect to the home/calendar page
- User is logged in (navbar shows your username)
- Success toast: `Signed in with passkey!`
- No error messages in the console

### DevTools Verification

Open DevTools → Application → Cookies → `localhost`:
- `access_token` cookie should be present (HttpOnly)
- `refresh_token` cookie should be present (HttpOnly)

---

## Test 3: Passkey Management — Delete (Frontend)

Tests passkey deletion from the profile page.

### Steps

1. Login (with password or passkey)
2. Go to **Profile → Security Settings**
3. Hover over the passkey card — a trash icon appears on the right
4. Click the trash icon
5. A confirmation dialog appears — click **Delete Passkey**

### Expected Results

- Success toast: `Passkey deleted`
- The passkey card disappears from the list
- If it was the only passkey, an empty state message appears

### Database Verification

```sql
SELECT * FROM passkeys WHERE user_id = 1;
-- Expected: no rows (or fewer rows if multiple registered)

SELECT passkey_enabled FROM users WHERE id = 1;
-- Expected: false (if no passkeys remain)
```

---

## Test 4: Backend API — Registration Begin

Tests the endpoint directly without going through the UI.

### Request

```javascript
// Run in browser DevTools console at http://localhost:3000

// 1. Login first
await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ username: 'admin', password: 'admin123', rememberMe: false })
});

// 2. Begin registration
const resp = await fetch('http://localhost:8080/api/auth/passkey/register/begin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'API Test Key' })
});

console.log('Status:', resp.status);
console.log('Body:', await resp.json());
```

### Expected Response

**Status:** `200 OK`

```json
{
  "challenge": "<base64url-encoded-random-bytes>",
  "userId": "<base64url-encoded-user-id>",
  "username": "admin",
  "rpId": "localhost",
  "rpName": "Smart Academic Calendar"
}
```

**Key things to verify:**
- `challenge` is a non-empty base64url string (no `+`, `/`, or `=` characters)
- `userId` is a base64url string (not a plain number like `"1"`)
- `rpId` is `"localhost"` in the Docker environment

### Database Check

```sql
SELECT user_id, challenge, expires_at FROM passkey_sessions ORDER BY created_at DESC LIMIT 1;
-- Expected: a new row with expires_at ~10 minutes from now
```

---

## Test 5: Backend API — Authentication Begin

Tests the public challenge endpoint.

```javascript
// No auth required
const resp = await fetch('http://localhost:8080/api/auth/passkey/authenticate/begin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

console.log('Status:', resp.status);
console.log('Body:', await resp.json());
```

### Expected Response

**Status:** `200 OK`

```json
{
  "challenge": "<base64url-encoded-random-bytes>",
  "rpId": "localhost"
}
```

### Database Check

```sql
SELECT user_id, challenge, expires_at FROM passkey_sessions ORDER BY created_at DESC LIMIT 1;
-- Expected: user_id IS NULL (passwordless - no user identified yet)
```

---

## Test 6: Backend API — List Passkeys

```javascript
// Must be logged in
const resp = await fetch('http://localhost:8080/api/auth/passkeys', {
  credentials: 'include'
});

console.log('Status:', resp.status);
console.log('Passkeys:', await resp.json());
```

### Expected Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Test Laptop",
    "credentialId": "<base64url>",
    "createdAt": "2026-02-19T18:30:00"
  }
]
```

Empty array `[]` if no passkeys registered yet.

---

## Test 7: Backend API — Delete Passkey

```javascript
// Delete passkey with ID 1
const resp = await fetch('http://localhost:8080/api/auth/passkeys/1', {
  method: 'DELETE',
  credentials: 'include'
});

console.log('Status:', resp.status); // Expected: 200
```

---

## Test 8: Error Scenarios

### 8.1 — Register Without Being Logged In

```javascript
// Clear cookies
document.cookie.split(';').forEach(c => {
  document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});

const resp = await fetch('http://localhost:8080/api/auth/passkey/register/begin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ name: 'Test' })
});

console.log('Status:', resp.status); // Expected: 403
```

### 8.2 — Cancel Browser WebAuthn Prompt

1. On the Profile page, click **Register New Passkey**
2. Enter a name and click **Register**
3. When the browser prompt appears, click **Cancel** or press Escape

**Expected:** Error message appears in the dialog explaining the registration was cancelled. The dialog stays open so you can try again.

### 8.3 — Complete Registration Without Beginning

```javascript
const resp = await fetch('http://localhost:8080/api/auth/passkey/register/complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    id: 'fake-id',
    rawId: 'ZmFrZQ',
    type: 'public-key',
    response: { clientDataJSON: 'ZmFrZQ', attestationObject: 'ZmFrZQ' }
  })
});

console.log('Status:', resp.status); // Expected: 400
```

### 8.4 — Delete a Non-Existent Passkey

```javascript
const resp = await fetch('http://localhost:8080/api/auth/passkeys/999', {
  method: 'DELETE',
  credentials: 'include'
});

console.log('Status:', resp.status); // Expected: 400 or 403
```

### 8.5 — List Passkeys Without Auth

```javascript
const resp = await fetch('http://localhost:8080/api/auth/passkeys');
console.log('Status:', resp.status); // Expected: 401 or 403
```

### 8.6 — Stale Session (Re-registering Without Completing)

1. Click **Register New Passkey**, enter a name, click **Register**
2. Cancel the browser prompt
3. Immediately click **Register New Passkey** again and complete it

**Expected:** The second attempt succeeds. Old sessions are automatically cleared when a new `begin` is called.

---

## Test 9: Token Refresh Interaction

Verify that automatic token refresh doesn't interfere with passkey operations.

### Steps

1. Login with password
2. Wait 1 minute (token refresh triggers at the 1-minute interval)
3. Check DevTools Console for:
   ```
   [TokenRefresh] Interval triggered...
   [TokenRefresh] Token refreshed successfully
   ```
4. Without refreshing the page, attempt to register a passkey

**Expected:** Passkey registration works normally after token refresh. The new token is used for the credentialled requests.

---

## Debugging

### View Backend Logs in Real Time

```powershell
docker logs smart-academic-calendar-backend -f
```

After a failed registration or authentication, look for lines like:

```
[WebAuthn] verifyRegistration - clientData: {"type":"webauthn.create","challenge":"...","origin":"http://localhost:3000",...}
[WebAuthn] verifyRegistration - expectedChallenge: <value from DB>
[WebAuthn] verifyRegistration - configuredOrigin: http://localhost:3000
[Passkey] Registration complete failed for user: <error message>
```

### Clear All Stale Sessions

```powershell
docker exec smart-academic-calendar-db psql -U appuser -d appdb -c "DELETE FROM passkey_sessions;"
```

### Check Configured WebAuthn Origin

The origin **must** match the URL where the frontend is served:

| Environment | Correct Origin |
|-------------|---------------|
| Docker (default) | `http://localhost:3000` |
| Local Vite dev server | `http://localhost:5173` |

Check the active config:
```powershell
docker logs smart-academic-calendar-backend 2>&1 | Select-String "webauthn"
```

---

## Smoke Test Checklist

Run through this list after any backend or frontend change:

- [ ] All 4 Docker containers healthy
- [ ] Login with `admin` / `admin123` succeeds, cookies set
- [ ] Profile page shows Security Settings section
- [ ] Passkey registration completes end-to-end (browser prompt accepted)
- [ ] Registered passkey appears in the list with the correct name
- [ ] `passkeys` table has the new row; `passkey_sessions` is empty after completion
- [ ] `users.passkey_enabled = true` for admin after registration
- [ ] Logout, then "Sign in with Passkey" is visible on the login page
- [ ] Passkey login redirects to home page; JWT cookies present
- [ ] Deleting a passkey removes it from the UI and the DB
- [ ] `passkey_enabled` becomes `false` when the last passkey is deleted
- [ ] No unhandled errors in the browser console throughout
