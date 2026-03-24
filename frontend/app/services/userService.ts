/**
 * User Service
 * Handles all API calls related to user management
 * Communicates with Spring Boot backend at /api/users
 */

import type { UserDTO, CreateUserRequest, LoginRequest, LoginResponse } from '~/types/user';

// Base API URL - Uses environment variable with fallback for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Validate API URL configuration on startup
if (!import.meta.env.VITE_API_URL) {
    console.warn(
        '[UserService] VITE_API_URL environment variable not set. ' +
        'Using default: http://localhost:8080/api. ' +
        'Set VITE_API_URL in .env file for production.'
    );
}

/**
 * Service class for user-related API operations
 */
export class UserService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // No need to manually add auth header - cookies are sent automatically
    return headers;
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
        headers: this.buildAuthHeaders(),
        credentials: 'include', // Send cookies
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
        headers: this.buildAuthHeaders(),
        credentials: 'include', // Send cookies
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
        headers: this.buildAuthHeaders(),
        credentials: 'include', // Send cookies
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

  /**
   * Register a new user account
   * Calls POST /api/auth/register endpoint
   * Creates account and automatically logs user in
   * @param request - CreateUserRequest with username, email, firstName, lastName, password
   * @returns Promise<LoginResponse> - User data and auth token
   */
  async register(request: CreateUserRequest): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const message = await response.text();
      return message;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Login with username and password
   * Tokens are set as HttpOnly cookies by the backend
   * @param request - LoginRequest with username, password, and rememberMe flag
   * @returns LoginResponse with user data (no token - in cookie)
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Receive and send cookies
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();

      // Store user info in localStorage for convenience
      // Token is stored in HttpOnly cookie by backend
      localStorage.setItem('currentUser', JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user by calling backend API and clearing stored data
   * Backend blacklists the refresh token and clears cookies
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Send cookies to be blacklisted
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
    }
  }

  /**
   * Get current user from localStorage
   * @returns Current user object or null if not logged in
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Refresh access token using refresh token cookie
   * @returns true if refresh succeeded, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send refresh token cookie
      });

      return response.ok;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Get current authenticated user from backend
   * @returns Promise<UserDTO> - Current user data
   */
  async getCurrentUserFromBackend(): Promise<UserDTO> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Send access token cookie
      });

      if (!response.ok) {
        throw new Error('Failed to get current user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
}

// Export a single instance for app-wide use
export const userService = new UserService();
