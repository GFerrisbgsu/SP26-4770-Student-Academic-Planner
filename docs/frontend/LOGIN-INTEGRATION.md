# Login Form Integration Guide

This guide explains how to use the login form component and integrate it with your Spring Boot backend.

## What Was Created

### Frontend Components

1. **LoginForm Component** (`app/components/LoginForm.tsx`)
   - Self-contained form component with built-in state management
   - Handles validation, error display, and loading states
   - Automatically stores auth token in localStorage
   - Can be embedded anywhere in your app

2. **Login Route** (`app/routes/login.tsx`)
   - Complete login page with professional UI
   - Uses LoginForm component
   - Accessible at `/login` URL

3. **Enhanced User Types** (`app/types/user.ts`)
   - `LoginRequest` - username and password
   - `LoginResponse` - user data and token
   - Used for type-safe API communication

4. **Updated UserService** (`app/services/userService.ts`)
   - `login()` - authenticate user and store token
   - `logout()` - clear auth token
   - `getAuthToken()` - retrieve stored token
   - `isAuthenticated()` - check login status

## Configuration: Frontend .env and API URL

- The frontend uses the Vite environment variable `VITE_API_URL` to determine the backend API host. Create or update `frontend/.env` with the API URL you want to target. Example (pointing to port 3000):

```dotenv
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

- Development vs production ports:
    - Vite dev server (development): `http://localhost:5173` — use this when running `npm run dev`.
    - Dockerized or production frontend may be served on port `3000` (depends on your container/config).
    - Backend (Spring Boot Docker): commonly `http://localhost:8080` — set `VITE_API_URL` accordingly if your backend runs on 8080.

- After changing `frontend/.env`, restart the frontend dev server so Vite picks up the new environment variables:

```bash
cd frontend
npm run dev
```


## Using the LoginForm Component

### Method 1: Standalone Login Page
The component already provides a login page at `/login`:

```
Navigate to: http://localhost:5173/login
```

### Method 2: Embed in Custom Component
```tsx
import { LoginForm } from '~/components/LoginForm';

export function MyComponent() {
  return (
    <LoginForm
      onLoginSuccess={() => console.log('User logged in!')}
      className="max-w-sm"
    />
  );
}
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onLoginSuccess` | `() => void` (optional) | Callback after successful login |
| `className` | `string` (optional) | CSS classes for styling |

## Backend Implementation Required

Your Spring Boot backend needs to implement an authentication endpoint. Create the following:

### 1. Backend Types (Java)

**LoginRequest.java**
```java
package com.sap.smart_academic_calendar.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;

    // Constructors, getters, setters
    public LoginRequest() {}
    
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

**LoginResponse.java**
```java
package com.sap.smart_academic_calendar.dto;

public class LoginResponse {
    private UserDTO user;
    private String token;

    public LoginResponse(UserDTO user, String token) {
        this.user = user;
        this.token = token;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
```

### 2. Authentication Service

**AuthService.java** (or add to existing UserService)
```java
package com.sap.smart_academic_calendar.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.sap.smart_academic_calendar.dto.LoginRequest;
import com.sap.smart_academic_calendar.dto.LoginResponse;
import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // Inject JWT token provider if using JWT
    // private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        // Find user by username
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid username or password");
        }

        User user = userOptional.get();

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        // Generate token (implement based on your auth strategy)
        String token = generateToken(user);

        // Convert to DTO (exclude password)
        UserDTO userDTO = new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt()
        );

        return new LoginResponse(userDTO, token);
    }

    private String generateToken(User user) {
        // TODO: Implement token generation
        // Options:
        // 1. JWT token (recommended for REST APIs)
        // 2. Session token
        // 3. Simple UUID token
        
        // Example: UUID token
        return UUID.randomUUID().toString();
        
        // Or if using JWT:
        // return jwtTokenProvider.generateToken(user.getId());
    }
}
```

### 3. Authentication Controller

**AuthController.java** (or add to UserController)
```java
package com.sap.smart_academic_calendar.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.sap.smart_academic_calendar.dto.LoginRequest;
import com.sap.smart_academic_calendar.dto.LoginResponse;
import com.sap.smart_academic_calendar.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
```

### 4. Update User Repository

Make sure your UserRepository has this method:

```java
package com.sap.smart_academic_calendar.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sap.smart_academic_calendar.model.User;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
}
```

## How It Works

1. **User enters credentials** in LoginForm
2. **Frontend submits** to `/api/auth/login` endpoint
3. **Backend validates** credentials against database
4. **Backend returns** user data + auth token
5. **Frontend stores** token in localStorage
6. **Frontend redirects** to home page (default behavior)

## Using Auth Token in Subsequent Requests

Once logged in, the auth token is stored in localStorage. Use it in subsequent API calls:

```typescript
// In any service method that requires authentication
async getProtectedData() {
  const token = userService.getAuthToken();
  
  const response = await fetch(`${this.baseUrl}/protected-endpoint`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,  // Add token
    },
  });
  
  return response.json();
}
```

## Logout Implementation

Call logout when user clicks logout button:

```typescript
import { userService } from '~/services/userService';
import { useNavigate } from 'react-router';

export function LogoutButton() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    userService.logout();
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## CORS Configuration

Ensure your backend CORS config allows auth requests:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

## Testing the Login Form

1. **Start frontend dev server:**
    ```bash
    cd frontend
    npm run dev
    ```

2. **Start backend:**
    ```bash
    # If running locally with Maven
    ./mvnw spring-boot:run

    # Or start via Docker Compose (backend + DB + pgAdmin)
    docker-compose up -d
    ```

3. **Navigate to login page:**
    ```
    http://localhost:5173/login
    ```

4. **Quick connectivity checks (curl):**
    ```bash
    # Check backend on port 8080
    curl http://localhost:8080/api/users

    # If your API is proxied to port 3000 (production container)
    curl http://localhost:3000/api/users
    ```

5. **Test with credentials** (seeded test user):
    - Username: `admin`
    - Password: `admin123`

    This user is created by the Flyway migration `V2__admin.sql` in the backend resources. If you need more test users, add them to that migration or insert directly into the database.

6. **Check the network request in the browser**:
    - Open DevTools (F12) → Network tab → submit login form
    - Inspect the `POST /api/auth/login` request URL and response

## Next Steps

1. Implement the backend DTOs and Authentication Service
2. Create the `/api/auth/login` endpoint 
3. Add password hashing in database migrations (BCrypt recommended)
4. Test login flow end-to-end
5. (Optional) Implement JWT tokens for enhanced security
6. (Optional) Add refresh token mechanism
7. (Optional) Add remember-me functionality

## Security Considerations

- **Always hash passwords** - Use BCrypt or similar
- **Use HTTPS in production** - Never send passwords over HTTP
- **Validate on backend** - Don't trust frontend validation alone
- **Secure token storage** - localStorage is vulnerable to XSS; consider HttpOnly cookies for production
- **Token expiration** - Implement token expiry and refresh mechanisms
- **Rate limiting** - Add login attempt rate limiting to prevent brute force attacks

## Customization

### Change Login Redirect URL
In `LoginForm.tsx`, modify the default navigation:
```typescript
// Line ~71: Change from
navigate('/');

// To:
navigate('/dashboard');
```

### Change Form Styling
Both `LoginForm.tsx` and `login.tsx` use Tailwind classes. Modify className strings to customize appearance.

### Change Token Storage
Modify `userService.ts` methods to use different storage:
```typescript
// Instead of localStorage:
sessionStorage.setItem('authToken', token);  // Session only
// Or use cookies with library like js-cookie
```

## Support

If you have questions or issues:
1. Check backend console for validation errors
2. Check browser DevTools Network tab to see API response
3. Check browser Console for frontend errors
4. Verify CORS configuration on backend
