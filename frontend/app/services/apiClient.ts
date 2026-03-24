/**
 * API Client with automatic token refresh on 401 responses
 * Wraps the fetch API and handles authentication token expiration gracefully
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the access token using the refresh token cookie
 * Uses a singleton pattern to prevent multiple simultaneous refresh requests
 */
async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, wait for that request to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('[ApiClient] Token refresh failed:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Enhanced fetch that automatically retries with token refresh on 401 errors
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options (extends RequestInit)
 * @returns Promise<Response>
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Ensure credentials are included to send cookies
  const finalOptions: RequestInit = {
    ...options,
    credentials: 'include',
  };

  // Make initial request
  let response = await fetch(url, finalOptions);

  // If 401 Unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log('[ApiClient] Received 401 - attempting token refresh');

    const refreshSuccess = await refreshAccessToken();

    if (refreshSuccess) {
      // Token refreshed successfully - retry original request
      console.log('[ApiClient] Token refreshed - retrying request');
      response = await fetch(url, finalOptions);
    } else {
      // Refresh failed - redirect to login
      console.warn('[ApiClient] Token refresh failed - session expired');
      
      // Clear any user data
      localStorage.removeItem('currentUser');
      sessionStorage.clear();
      
      // Redirect to login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
  }

  return response;
}

/**
 * Type-safe JSON fetch wrapper
 */
export async function apiFetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await apiFetch(url, options);

  if (!response.ok) {
    let message = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch { /* no JSON body */ }
    throw new Error(message);
  }

  return response.json();
}

/**
 * API Client class for making authenticated requests
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string): Promise<T> {
    return apiFetchJson<T>(`${this.baseUrl}${path}`, {
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown): Promise<T> {
    return apiFetchJson<T>(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown): Promise<T> {
    return apiFetchJson<T>(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    return apiFetchJson<T>(`${this.baseUrl}${path}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
