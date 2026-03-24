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
  firstName: string;
  lastName: string;
  createdAt: string; // ISO 8601 date string from backend LocalDateTime
}

/**
 * Request model for creating a new user
 * Matches CreateUserRequest.java in backend
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Request model for user login
 * Matches backend login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Response model from successful login
 * Returned by both traditional and passkey authentication
 */
export interface LoginResponse {
  userId: number;
  username: string;
  email: string;
}

/**
 * Response model for user login
 * Matches LoginResponse.java in backend
 */
export interface LoginResponse {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}
