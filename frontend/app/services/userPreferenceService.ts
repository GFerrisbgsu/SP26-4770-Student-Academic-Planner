const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_BASE_URL}/user-preferences`;

export interface UserPreference {
  id: number;
  userId: number;
  preferenceKey: string;
  preferenceValue: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUserPreference(userId: number, preferenceKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/user/${userId}/key/${encodeURIComponent(preferenceKey)}`, {
      credentials: 'include',
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      // Silently return null on auth failures (401) or other errors to prevent console spam
      // This can happen when session is expired but localStorage still has cached user data
      console.debug(`user preference fetch failed with status ${res.status}`);
      return null;
    }

    const preference: UserPreference = await res.json();
    return preference.preferenceValue ?? null;
  } catch (error) {
    // Network errors or parsing errors - return null as fallback
    console.debug('Error fetching user preference:', error);
    return null;
  }
}

export async function upsertUserPreference(
  userId: number,
  preferenceKey: string,
  preferenceValue: string,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/user/${userId}/key/${encodeURIComponent(preferenceKey)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ preferenceValue }),
  });

  if (!res.ok) {
    throw new Error('Failed to save user preference');
  }
}
