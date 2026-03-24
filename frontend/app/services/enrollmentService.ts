import { apiFetchJson, apiFetch } from '~/services/apiClient';
import type {
  UserCourseEnrollmentDTO,
  EnrollCourseRequest,
  AssignRequirementRequest,
  FulfillmentDTO,
} from '~/types/program';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const enrollmentService = {
  async getAllEnrollments(): Promise<UserCourseEnrollmentDTO[]> {
    return apiFetchJson<UserCourseEnrollmentDTO[]>(`${API_BASE_URL}/enrollments`);
  },

  async getEnrollmentsForSemester(semesterId: number): Promise<UserCourseEnrollmentDTO[]> {
    return apiFetchJson<UserCourseEnrollmentDTO[]>(
      `${API_BASE_URL}/enrollments/semester/${semesterId}`
    );
  },

  async getSemesterCredits(semesterId: number): Promise<number> {
    return apiFetchJson<number>(`${API_BASE_URL}/enrollments/credits/${semesterId}`);
  },

  async enrollCourse(request: EnrollCourseRequest): Promise<UserCourseEnrollmentDTO> {
    return apiFetchJson<UserCourseEnrollmentDTO>(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async unenrollCourse(courseId: string): Promise<void> {
    const response = await apiFetch(`${API_BASE_URL}/enrollments/${courseId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to unenroll: ${response.status}`);
    }
  },

  async assignFulfillment(request: AssignRequirementRequest): Promise<FulfillmentDTO> {
    return apiFetchJson<FulfillmentDTO>(`${API_BASE_URL}/enrollments/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async removeFulfillment(courseId: string, groupId: number): Promise<void> {
    const response = await apiFetch(
      `${API_BASE_URL}/enrollments/${courseId}/fulfill/${groupId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error(`Failed to remove fulfillment: ${response.status}`);
    }
  },
};
