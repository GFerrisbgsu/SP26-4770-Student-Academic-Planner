import { apiFetchJson } from '~/services/apiClient';
import type { ProgramDTO } from '~/types/program';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const programService = {
  async getProgram(id: number): Promise<ProgramDTO> {
    return apiFetchJson<ProgramDTO>(`${API_BASE_URL}/programs/${id}`);
  },

  async getAllPrograms(): Promise<ProgramDTO[]> {
    return apiFetchJson<ProgramDTO[]>(`${API_BASE_URL}/programs`);
  },
};
