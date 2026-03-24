/**
 * TodoList interface matching backend TodoListDTO
 */
export interface TodoList {
  id: number;
  userId: number;
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
  listOrder: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request interface for creating/updating todo lists
 */
export interface CreateTodoListRequest {
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
  listOrder?: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Get all to-do lists for the authenticated user
 */
export async function getUserTodoLists(userId: number): Promise<TodoList[]> {
  const response = await fetch(`${API_BASE_URL}/todo-lists/user/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch to-do lists');
  }

  return response.json();
}

/**
 * Get a specific to-do list by ID
 */
export async function getTodoListById(listId: number): Promise<TodoList> {
  const response = await fetch(`${API_BASE_URL}/todo-lists/${listId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch to-do list');
  }

  return response.json();
}

/**
 * Create a new to-do list
 */
export async function createTodoList(userId: number, request: CreateTodoListRequest): Promise<TodoList> {
  const response = await fetch(`${API_BASE_URL}/todo-lists/user/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to create to-do list');
  }

  return response.json();
}

/**
 * Update a to-do list
 */
export async function updateTodoList(userId: number, listId: number, request: CreateTodoListRequest): Promise<TodoList> {
  const response = await fetch(`${API_BASE_URL}/todo-lists/user/${userId}/list/${listId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to update to-do list');
  }

  return response.json();
}

/**
 * Delete a to-do list
 */
export async function deleteTodoList(userId: number, listId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todo-lists/user/${userId}/list/${listId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete to-do list');
  }
}

/**
 * Create default to-do lists for a new user
 */
export async function createDefaultLists(userId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/todo-lists/user/${userId}/defaults`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to create default lists');
  }
}
