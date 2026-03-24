const BASE_URL = 'http://localhost:8080/api/user-preferences';

export interface UserPreference {
  id: number;
  userId: number;
  preferenceKey: string;
  preferenceValue: string;
  createdAt: string;
  updatedAt: string;
}

export async function getUserPreference(userId: number, preferenceKey: string): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/user/${userId}/key/${encodeURIComponent(preferenceKey)}`, {
    credentials: 'include',
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch user preference');
  }

  const preference: UserPreference = await res.json();
  return preference.preferenceValue ?? null;
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
