/**
 * Base service class for API communication
 * 
 * Provides common patterns for CRUD operations with offline support,
 * error handling, and automatic request queueing.
 * 
 * @example
 * ```ts
 * import { BaseService } from '~/services/baseService';
 * 
 * export class EventService extends BaseService<Event, CreateEventDTO> {
 *   constructor() {
 *     super('/events');
 *   }
 *   
 *   // Custom methods can be added
 *   async completeEvent(id: string): Promise<void> {
 *     return this.patch(`/${id}/complete`, {});
 *   }
 * }
 * 
 * export const eventService = new EventService();
 * ```
 */

import { enqueueRequest } from '~/utils/network/requestQueue';
import { apiFetch } from '~/services/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/** Base response type */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Base service class with common CRUD operations
 * 
 * Follows the pattern from userService.ts with added offline support.
 */
export abstract class BaseService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected baseUrl: string;
  protected endpoint: string;

  constructor(endpoint: string, baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.endpoint = endpoint;
  }

  /**
   * Get full URL for endpoint
   */
  protected getUrl(path: string = ''): string {
    return `${this.baseUrl}${this.endpoint}${path}`;
  }

  /**
   * Make HTTP request with error handling and automatic token refresh
   * Uses apiFetch which auto-retries on 401 by refreshing token
   */
  protected async request<R>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string = '',
    body?: unknown,
    queueOnFailure: boolean = true
  ): Promise<R> {
    const url = this.getUrl(path);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for auth
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(body);
    }

    try {
      // Use apiFetch instead of fetch for automatic 401 retry with token refresh
      const response = await apiFetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 404) {
          throw new Error(`Resource not found: ${url}`);
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${errorText || response.statusText}`);
        } else if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses (e.g., 204 No Content)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return undefined as R;
      }

      return await response.json() as R;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`API request failed: ${method} ${url}`, errorMessage);

      // Queue request for later if it's a mutation and offline capable
      if (queueOnFailure && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
        console.log('Queueing failed request for later retry');
        
        await enqueueRequest({
          endpoint: `${this.endpoint}${path}`,
          method,
          payload: body,
          metadata: {
            feature: this.endpoint.replace(/^\//, ''),
            timestamp: Date.now()
          }
        });
      }

      throw error;
    }
  }

  /**
   * GET - Retrieve all items
   */
  async getAll(): Promise<T[]> {
    return this.request<T[]>('GET', '', undefined, false);
  }

  /**
   * GET - Retrieve single item by ID
   */
  async getById(id: string | number): Promise<T> {
    return this.request<T>('GET', `/${id}`, undefined, false);
  }

  /**
   * POST - Create new item
   */
  async create(data: CreateDTO): Promise<T> {
    return this.request<T>('POST', '', data);
  }

  /**
   * PUT - Replace entire item
   */
  async update(id: string | number, data: UpdateDTO): Promise<T> {
    return this.request<T>('PUT', `/${id}`, data);
  }

  /**
   * PATCH - Update partial item
   */
  async patch(path: string, data: Partial<UpdateDTO>): Promise<T> {
    return this.request<T>('PATCH', path, data);
  }

  /**
   * DELETE - Remove item
   */
  async delete(id: string | number): Promise<void> {
    return this.request<void>('DELETE', `/${id}`);
  }

  /**
   * Custom GET request
   */
  protected async get<R>(path: string): Promise<R> {
    return this.request<R>('GET', path, undefined, false);
  }

  /**
   * Custom POST request
   */
  protected async post<R>(path: string, data: unknown): Promise<R> {
    return this.request<R>('POST', path, data);
  }
}
