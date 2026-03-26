import type { DegreeProgressDTO, RequirementCategoryDTO } from '~/types/course';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_BASE_URL}/courses`;

export interface Course {
  id: string;
  name: string;
  code: string;
  subject?: string;
  number?: string;
  color: string;
  instructor: string;
  schedule: string;
  credits?: number;
  enrolled?: boolean;
  semesters: string[];
  history: string[];
  description?: string;
  prerequisiteText?: string;
}

export interface CreateCourseRequest {
  id: string;
  name: string;
  code: string;
  subject?: string;
  number?: string;
  color: string;
  instructor: string;
  schedule: string;
  credits?: number;
  enrolled?: boolean;
  semesters: string[];
  history: string[];
  description?: string;
  prerequisiteText?: string;
}

/**
 * Get all courses
 */
export async function getAllCourses(): Promise<Course[]> {
  const res = await fetch(`${BASE_URL}`, {
    credentials: 'include' // Send HttpOnly cookies for authentication
  })
  if (!res.ok) throw new Error("Failed to fetch courses")
  return res.json()
}

/**
 * Get a specific course by ID
 */
export async function getCourseById(id: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Failed to fetch course ${id}`)
  return res.json()
}

/**
 * Get all enrolled courses
 */
export async function getEnrolledCourses(): Promise<Course[]> {
  const res = await fetch(`${BASE_URL}/enrolled`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error("Failed to fetch enrolled courses")
  return res.json()
}

/**
 * Get courses by subject
 */
export async function getCoursesBySubject(subject: string): Promise<Course[]> {
  const res = await fetch(`${BASE_URL}/subject/${subject}`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Failed to fetch courses for subject ${subject}`)
  return res.json()
}

/**
 * Create a new course
 */
export async function createCourse(courseData: CreateCourseRequest): Promise<Course> {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(courseData)
  })
  if (!res.ok) throw new Error("Failed to create course")
  return res.json()
}

/**
 * Update an existing course
 */
export async function updateCourse(id: string, courseData: CreateCourseRequest): Promise<Course> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(courseData)
  })
  if (!res.ok) throw new Error(`Failed to update course ${id}`)
  return res.json()
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Failed to delete course ${id}`)
}

/**
 * Enroll in a course (sets enrolled=true).
 * Optionally provide a schedule if the course doesn't have one.
 */
export async function enrollInCourse(id: string, schedule?: string): Promise<Course> {
  const params = schedule ? `?schedule=${encodeURIComponent(schedule)}` : ''
  const res = await fetch(`${BASE_URL}/${id}/enroll${params}`, {
    method: "PATCH",
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Failed to enroll in course ${id}`)
  return res.json()
}

/**
 * Unenroll from a course (sets enrolled=false).
 */
export async function unenrollFromCourse(id: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}/${id}/unenroll`, {
    method: "PATCH",
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Failed to unenroll from course ${id}`)
  return res.json()
}

/**
 * Update a course's schedule.
 */
export async function updateCourseSchedule(id: string, schedule: string): Promise<Course> {
  const res = await fetch(`${BASE_URL}/${id}/schedule?schedule=${encodeURIComponent(schedule)}`, {
    method: "PATCH",
    credentials: 'include'
  })
  if (!res.ok) throw new Error(`Failed to update schedule for course ${id}`)
  return res.json()
}

export async function getDegreeProgress(): Promise<DegreeProgressDTO> {
  const res = await fetch(`${BASE_URL}/degree/progress`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch degree progress");
  return res.json();
}

export async function getRequirementCategories(): Promise<RequirementCategoryDTO[]> {
  const res = await fetch(`${BASE_URL}/degree/requirements`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch requirement categories");
  return res.json();
}