/**
 * User Settings related TypeScript types/interfaces
 * Maps to backend DTOs for user settings management
 */

/**
 * User Settings Data Transfer Object
 * Matches UserSettingsDTO.java in backend
 */
export interface UserSettingsDTO {
  id: number;
  userId: number;
  phoneNumber?: string;
  timeZone?: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  defaultCalendarView?: string;
  themePreference?: string;
  reminderMinutesBefore?: number;
  createdAt: string; // ISO 8601 date string from backend LocalDateTime
  updatedAt: string; // ISO 8601 date string from backend LocalDateTime
}

/**
 * Request model for updating user settings
 * Matches UpdateUserSettingsRequest.java in backend
 */
export interface UpdateUserSettingsRequest {
  phoneNumber?: string;
  timeZone?: string;
  notificationsEnabled?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  defaultCalendarView?: string;
  themePreference?: string;
  reminderMinutesBefore?: number;
}