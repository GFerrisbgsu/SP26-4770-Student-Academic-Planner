import { apiFetchJson, apiFetch } from '~/services/apiClient';
import type { SemesterDTO, UserSemesterDTO, RollbackSemesterRequest } from '~/types/program';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const semesterService = {
  async getAllSemesters(): Promise<SemesterDTO[]> {
    return apiFetchJson<SemesterDTO[]>(`${API_BASE_URL}/semesters`);
  },

  async getCurrentSemester(): Promise<UserSemesterDTO> {
    return apiFetchJson<UserSemesterDTO>(`${API_BASE_URL}/semesters/current`);
  },

  async advanceSemester(): Promise<UserSemesterDTO> {
    return apiFetchJson<UserSemesterDTO>(`${API_BASE_URL}/semesters/advance`, {
      method: 'POST',
    });
  },

  async rollbackSemester(request: RollbackSemesterRequest): Promise<UserSemesterDTO> {
    return apiFetchJson<UserSemesterDTO>(`${API_BASE_URL}/semesters/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
  },

  async switchProgram(programId: number): Promise<UserSemesterDTO> {
    return apiFetchJson<UserSemesterDTO>(`${API_BASE_URL}/semesters/switch-program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId }),
    });
  },
};
