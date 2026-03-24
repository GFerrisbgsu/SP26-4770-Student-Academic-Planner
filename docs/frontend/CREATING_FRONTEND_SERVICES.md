# Creating Frontend Services & API Integration

This guide explains how to create frontend services to interact with the Spring Boot backend REST API.

## Architecture Overview

The frontend follows a service-oriented architecture for API communication:

1. **Types Layer** (`app/types/`) - TypeScript interfaces matching backend DTOs
2. **Service Layer** (`app/services/`) - Classes that handle API calls to backend
3. **Component Layer** (`app/components/`) - React components that use services
4. **Routes Layer** (`app/routes/`) - Page components that orchestrate data flow

## Prerequisites

Before creating frontend services, ensure:

- ✅ Backend API endpoints are working (test with curl or Postman)
- ✅ CORS is configured in backend to allow `http://localhost:5173`
- ✅ Backend is running on `http://localhost:8080`
- ✅ Frontend dev server is running on `http://localhost:5173`

---

## Step-by-Step Guide

### Example: Creating a Frontend Service for Users

We'll create TypeScript types and a service class to interact with the `/api/users` endpoints.

---

## Step 1: Create TypeScript Types

Create type definitions that match your backend DTOs exactly.

**File:** `app/types/user.ts`

```typescript
/**
 * User-related TypeScript types/interfaces
 * Maps to backend DTOs for user management
 */

/**
 * User Data Transfer Object
 * Matches UserDTO.java in backend
 */
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  createdAt: string; // ISO 8601 date string from backend LocalDateTime
}

/**
 * Request model for creating a new user
 * Matches CreateUserRequest.java in backend
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}
```

**Key Points:**
- Interface names should match backend DTO class names
- Java `Long` → TypeScript `number`
- Java `LocalDateTime` → TypeScript `string` (ISO 8601 format)
- Use JSDoc comments to document each type
- Export all interfaces for use in other files

---

## Step 2: Create the Service Class

Create a service class with methods for each API endpoint.

**File:** `app/services/userService.ts`

```typescript
/**
 * User Service
 * Handles all API calls related to user management
 * Communicates with Spring Boot backend at /api/users
 */

import type { UserDTO, CreateUserRequest } from '~/types/user';

// Base API URL - TODO: Move to environment configuration
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Service class for user-related API operations
 */
export class UserService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all users from the backend
   * Calls GET /api/users endpoint
   * @returns Promise<UserDTO[]> - Array of all users
   */
  async getAllUsers(): Promise<UserDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const users: UserDTO[] = await response.json();
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Fetch a single user by ID
   * Calls GET /api/users/{id} endpoint
   * @param id - User ID
   * @returns Promise<UserDTO> - User data
   */
  async getUserById(id: number): Promise<UserDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User with ID ${id} not found`);
        }
        throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`);
      }

      const user: UserDTO = await response.json();
      return user;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * Calls POST /api/users endpoint
   * @param request - CreateUserRequest with username, email, password
   * @returns Promise<UserDTO> - Created user data
   */
  async createUser(request: CreateUserRequest): Promise<UserDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid user data provided');
        }
        throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
      }

      const createdUser: UserDTO = await response.json();
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

// Export a singleton instance for convenient usage throughout the app
export const userService = new UserService();
```

**Key Points:**
- Use `fetch` API for HTTP requests (or use axios library)
- Add proper TypeScript types for parameters and return values
- Use `async/await` for asynchronous operations
- Include error handling with try/catch
- Log errors to console for debugging
- Export a singleton instance for easy importing
- Add JSDoc comments for IntelliSense

---

## Step 3: Use the Service in Components

### Option A: Call on App Startup (root.tsx)

To fetch data when the app loads:

**File:** `app/root.tsx`

```typescript
import { useEffect } from "react";
import { userService } from "~/services/userService";

export default function App() {
  // 🔥 STARTUP CALL: Fetch users from backend on app initialization
  // This useEffect runs once when the app mounts and logs all users to console
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('🚀 Fetching users from backend on app startup...');
        const users = await userService.getAllUsers();
        console.log('✅ Users fetched successfully:', users);
        console.log(`📊 Total users: ${users.length}`);
      } catch (error) {
        console.error('❌ Failed to fetch users on startup:', error);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on mount

  return <Outlet />;
}
```

### Option B: Use in a Page Component

**File:** `app/routes/users.tsx`

```typescript
import { useState, useEffect } from 'react';
import type { UserDTO } from '~/types/user';
import { userService } from '~/services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul className="space-y-2">
        {users.map(user => (
          <li key={user.id} className="p-4 border rounded">
            <p className="font-semibold">{user.username}</p>
            <p className="text-gray-600">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Option C: Use in an Event Handler

**File:** `app/components/CreateUserForm.tsx`

```typescript
import { useState } from 'react';
import type { CreateUserRequest } from '~/types/user';
import { userService } from '~/services/userService';

export function CreateUserForm() {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      const createdUser = await userService.createUser(formData);
      console.log('User created successfully:', createdUser);
      alert(`User ${createdUser.username} created!`);
      // Reset form
      setFormData({ username: '', email: '', password: '' });
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={e => setFormData({ ...formData, username: e.target.value })}
        className="border p-2 rounded w-full"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        className="border p-2 rounded w-full"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={e => setFormData({ ...formData, password: e.target.value })}
        className="border p-2 rounded w-full"
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## Step 4: Add the Route (if needed)

If creating a dedicated users page, add it to routes:

**File:** `app/routes.ts`

```typescript
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  // ... existing routes
  route("users", "routes/users.tsx"),
] satisfies RouteConfig;
```

---

## Example: Creating a Course Service

Let's create a complete example for the Course entity.

### Step 1: Create Course Types

**File:** `app/types/course.ts`

```typescript
/**
 * Course-related TypeScript types/interfaces
 * Maps to backend DTOs for course management
 */

/**
 * Course Data Transfer Object
 * Matches CourseDTO.java in backend
 */
export interface CourseDTO {
  id: number;
  userId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  grade: string | null;
  createdAt: string;
}

/**
 * Request model for creating a new course
 * Matches CreateCourseRequest.java in backend
 */
export interface CreateCourseRequest {
  userId: number;
  courseName: string;
  courseCode: string;
  credits: number;
  grade?: string;
}
```

### Step 2: Create Course Service

**File:** `app/services/courseService.ts`

```typescript
/**
 * Course Service
 * Handles all API calls related to course management
 */

import type { CourseDTO, CreateCourseRequest } from '~/types/course';

const API_BASE_URL = 'http://localhost:8080/api';

export class CourseService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all courses
   * @returns Promise<CourseDTO[]>
   */
  async getAllCourses(): Promise<CourseDTO[]> {
    const response = await fetch(`${this.baseUrl}/courses`);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch courses for a specific user
   * @param userId - User ID
   * @returns Promise<CourseDTO[]>
   */
  async getCoursesByUserId(userId: number): Promise<CourseDTO[]> {
    const response = await fetch(`${this.baseUrl}/courses?userId=${userId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user courses: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Fetch a single course by ID
   * @param id - Course ID
   * @returns Promise<CourseDTO>
   */
  async getCourseById(id: number): Promise<CourseDTO> {
    const response = await fetch(`${this.baseUrl}/courses/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Course with ID ${id} not found`);
      }
      throw new Error(`Failed to fetch course: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create a new course
   * @param request - CreateCourseRequest
   * @returns Promise<CourseDTO>
   */
  async createCourse(request: CreateCourseRequest): Promise<CourseDTO> {
    const response = await fetch(`${this.baseUrl}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create course: ${response.statusText}`);
    }
    return response.json();
  }
}

export const courseService = new CourseService();
```

---

## Best Practices

### 1. Environment Configuration

Don't hardcode API URLs. Use environment variables:

**File:** `.env` (create at project root)

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

**Update service:**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

### 2. Error Handling

Create a custom error handler:

**File:** `app/utils/apiError.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || response.statusText,
      errorData
    );
  }
  return response.json();
}
```

**Use in service:**

```typescript
async getAllUsers(): Promise<UserDTO[]> {
  const response = await fetch(`${this.baseUrl}/users`);
  return handleApiResponse<UserDTO[]>(response);
}
```

### 3. Request Interceptors

Create a custom fetch wrapper for common headers/auth:

**File:** `app/utils/apiClient.ts`

```typescript
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Add auth token here later:
      // 'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

**Use in service:**

```typescript
import { apiClient } from '~/utils/apiClient';

async getAllUsers(): Promise<UserDTO[]> {
  return apiClient<UserDTO[]>('/users');
}

async createUser(request: CreateUserRequest): Promise<UserDTO> {
  return apiClient<UserDTO>('/users', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
```

### 4. Loading States with React Query (Optional)

For advanced data fetching, consider using React Query:

```bash
npm install @tanstack/react-query
```

**File:** `app/hooks/useUsers.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { userService } from '~/services/userService';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAllUsers(),
  });
}
```

**Use in component:**

```typescript
function UsersPage() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.username}</li>
      ))}
    </ul>
  );
}
```

---

## Testing API Calls

### Manual Testing with Browser Console

Open browser DevTools (F12) and run:

```javascript
// Import the service (if available in module scope)
// Or test directly with fetch:

fetch('http://localhost:8080/api/users')
  .then(res => res.json())
  .then(data => console.log('Users:', data))
  .catch(err => console.error('Error:', err));

// Test POST request
fetch('http://localhost:8080/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  })
})
  .then(res => res.json())
  .then(data => console.log('Created:', data))
  .catch(err => console.error('Error:', err));
```

### Automated Testing with Vitest

**File:** `app/services/userService.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { UserService } from './userService';
import type { UserDTO } from '~/types/user';

describe('UserService', () => {
  it('should fetch all users', async () => {
    const mockUsers: UserDTO[] = [
      { id: 1, username: 'john', email: 'john@test.com', createdAt: '2026-01-01' },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      } as Response)
    );

    const service = new UserService();
    const users = await service.getAllUsers();

    expect(users).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/users',
      expect.any(Object)
    );
  });
});
```

---

## Quick Reference Checklist

When creating a new frontend service:

- [ ] Create types in `app/types/[entity].ts`
- [ ] Create service class in `app/services/[entity]Service.ts`
- [ ] Implement methods for each API endpoint (GET, POST, etc.)
- [ ] Add proper TypeScript types and error handling
- [ ] Export singleton instance
- [ ] Use service in components/routes
- [ ] Test manually in browser console
- [ ] Add to startup call in `root.tsx` if needed
- [ ] Document any environment variables needed

---

## Common Issues & Troubleshooting

### CORS Errors

**Error:** `Access to fetch at 'http://localhost:8080/api/users' has been blocked by CORS policy`

**Solution:** Ensure backend has CORS configured (see backend CORS documentation)

### Network Errors

**Error:** `Failed to fetch` or `ERR_CONNECTION_REFUSED`

**Solution:** 
- Verify backend is running on port 8080
- Check URL is correct (`http://localhost:8080/api/...`)
- Try accessing URL directly in browser

### 404 Not Found

**Error:** `404 Not Found` on API call

**Solution:**
- Verify endpoint path matches backend controller (`/api/users` not `/users`)
- Check backend logs to confirm endpoint is registered

### Type Mismatch

**Error:** TypeScript errors about missing properties

**Solution:**
- Ensure TypeScript interfaces match backend DTOs exactly
- Check for nullable fields (use `| null` or `?:`)
- Java `Long` → TypeScript `number`
- Java `LocalDateTime` → TypeScript `string`

---

## Next Steps

1. Create services for all your backend entities (users, courses, events, etc.)
2. Set up environment variables for different environments (dev, prod)
3. Consider adding authentication/authorization headers
4. Implement proper error handling UI (toast notifications, error boundaries)
5. Add loading states and optimistic updates for better UX
6. Consider using React Query or SWR for advanced data fetching
