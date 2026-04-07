import type { UserSettingsDTO, UpdateUserSettingsRequest } from '~/types/userSettings';
import { apiFetch } from '~/services/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export class UserSettingsService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async getUserSettings(userId: number): Promise<UserSettingsDTO> {
    const response = await apiFetch(`${this.baseUrl}/user-settings/user/${userId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user settings');
    }

    return response.json();
  }

  async updateUserSettings(userId: number, request: UpdateUserSettingsRequest): Promise<UserSettingsDTO> {
    const response = await apiFetch(`${this.baseUrl}/user-settings/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update user settings');
    }

    return response.json();
  }
}

export const userSettingsService = new UserSettingsService();
