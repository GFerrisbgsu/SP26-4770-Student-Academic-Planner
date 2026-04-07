const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_BASE_URL}/assignments`;
import { apiFetch } from '~/services/apiClient';

export type AssignmentStatus = 'todo' | 'in-progress' | 'completed';

type BackendAssignmentStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

interface AssignmentDTO {
  id: number;
  courseId: string;
  title: string;
  description?: string;
  status: BackendAssignmentStatus;
  dueDate: string;
  points?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: number;
  courseId: string;
  title: string;
  description?: string;
  status: AssignmentStatus;
  dueDate: Date;
  points?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  dueDate: string;
  points?: number;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  points?: number;
  status?: AssignmentStatus;
}

function toBackendStatus(status: AssignmentStatus): BackendAssignmentStatus {
  if (status === 'in-progress') {
    return 'IN_PROGRESS';
  }
  if (status === 'completed') {
    return 'COMPLETED';
  }
  return 'TODO';
}

function fromBackendStatus(status: string): AssignmentStatus {
  if (status === 'IN_PROGRESS') {
    return 'in-progress';
  }
  if (status === 'COMPLETED') {
    return 'completed';
  }
  return 'todo';
}

function mapAssignment(dto: AssignmentDTO): Assignment {
  return {
    id: dto.id,
    courseId: dto.courseId,
    title: dto.title,
    description: dto.description,
    status: fromBackendStatus(dto.status),
    dueDate: new Date(dto.dueDate),
    points: dto.points,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export async function getAssignmentsByCourse(courseId: string, status?: AssignmentStatus): Promise<Assignment[]> {
  const statusParam = status ? `?status=${encodeURIComponent(toBackendStatus(status))}` : '';
  const res = await apiFetch(`${BASE_URL}/course/${courseId}${statusParam}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch assignments for course ${courseId}`);
  }

  const data: AssignmentDTO[] = await res.json();
  return data.map(mapAssignment);
}

export async function getAssignmentsForCourses(courseIds: string[]): Promise<Assignment[]> {
  if (courseIds.length === 0) {
    return [];
  }

  const settled = await Promise.allSettled(courseIds.map((courseId) => getAssignmentsByCourse(courseId)));
  const assignments: Assignment[] = [];

  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      assignments.push(...result.value);
    }
  });

  return assignments;
}

export async function createAssignment(courseId: string, request: CreateAssignmentRequest): Promise<Assignment> {
  const res = await apiFetch(`${BASE_URL}/course/${courseId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error('Failed to create assignment');
  }

  const data: AssignmentDTO = await res.json();
  return mapAssignment(data);
}

export async function updateAssignment(assignmentId: number, request: UpdateAssignmentRequest): Promise<Assignment> {
  const payload = {
    ...request,
    status: request.status ? toBackendStatus(request.status) : undefined,
  };

  const res = await apiFetch(`${BASE_URL}/${assignmentId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to update assignment');
  }

  const data: AssignmentDTO = await res.json();
  return mapAssignment(data);
}

export async function deleteAssignment(assignmentId: number): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${assignmentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to delete assignment');
  }
}
