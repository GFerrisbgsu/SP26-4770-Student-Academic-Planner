/**
 * Course-related TypeScript types/interfaces
 * Maps to backend DTOs for course management
 */

/**
 * Course Data Transfer Object
 * Matches CourseDTO.java in backend
 */
export interface CourseDTO {
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
  semesters?: string[];
  history?: string[];
  description?: string;
  prerequisiteText?: string;
}

/**
 * Alias for CourseDTO - matches the Course interface in services/courseService.ts
 */
export type Course = CourseDTO;

/**
 * Course Information and Metadata
 * Matches CourseInfoDTO.java in backend
 */
export interface CourseInfoDTO {
  courseId: string;
  prerequisites: string[];
  program: string;
  courseType: string;
}

export interface DegreeProgressDTO {
  program: string;
  expectedGraduation: string;
  totalCreditsRequired: number;
  creditsCompleted: number;
  creditsInProgress: number;
}

export interface RequirementCourseDTO {
  code: string;
  name: string;
  credits: number;
  status: 'completed' | 'inProgress' | 'notStarted';
}

export interface RequirementCategoryDTO {
  name: string;
  required: number;
  completed: number;
  inProgress: number;
  courses: RequirementCourseDTO[];
}