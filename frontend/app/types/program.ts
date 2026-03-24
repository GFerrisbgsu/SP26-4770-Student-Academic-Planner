/**
 * TypeScript types for the Program / Degree Requirements hierarchy.
 * Maps to backend DTOs: ProgramDTO, RequirementCategoryDTO, RequirementGroupDTO, etc.
 */

// ── Program Hierarchy ──

export interface ProgramDTO {
  id: number;
  name: string;
  degreeType: string;
  totalCreditsRequired: number;
  minGpa: number;
  catalogYear?: string;
  catalogUrl?: string;
  description?: string;
  admissionRequirements?: string;
  graduationNotes?: string;
  categories?: RequirementCategoryDTO[];
}

export interface RequirementCategoryDTO {
  id: number;
  name: string;
  description?: string;
  totalCreditsRequired?: number;
  sortOrder: number;
  groups: RequirementGroupDTO[];
}

export interface RequirementGroupDTO {
  id: number;
  name: string;
  description?: string;
  selectionRule: string;
  minCoursesRequired?: number;
  minCreditsRequired?: number;
  constraintNotes?: string;
  exclusive?: boolean;
  sortOrder: number;
  options: RequirementOptionDTO[];
}

export interface RequirementOptionDTO {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  courses: RequirementCourseDTO[];
}

export interface RequirementCourseDTO {
  id: number;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits?: number;
  sortOrder: number;
}

// ── Semester ──

export interface SemesterDTO {
  id: number;
  name: string;
  term: 'FALL' | 'SPRING' | 'SUMMER';
  yearNumber: number;
  sortOrder: number;
  maxCredits: number;
}

export interface UserSemesterDTO {
  id: number;
  userId: number;
  currentSemester: SemesterDTO;
  programId?: number;
  programName?: string;
}

// ── Enrollment ──

export interface UserCourseEnrollmentDTO {
  id: number;
  userId: number;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits?: number;
  semesterId: number;
  semesterName: string;
  status: 'ENROLLED' | 'COMPLETED';
  grade?: string;
  fulfillments: FulfillmentDTO[];
}

export interface FulfillmentDTO {
  id: number;
  requirementGroupId: number;
  requirementGroupName: string;
  slotIndex: number;
}

// ── Request types ──

export interface EnrollCourseRequest {
  courseId: string;
  semesterId: number;
}

export interface AssignRequirementRequest {
  courseId: string;
  requirementGroupId: number;
  slotIndex?: number;
}

export interface RollbackSemesterRequest {
  targetSemesterId: number;
}
