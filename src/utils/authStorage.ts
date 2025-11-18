export interface StoredUserData {
  id?: number;
  user_id?: number;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  [key: string]: unknown;
}

export function getStoredUserData(): StoredUserData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem('user_data');
    if (!raw) return null;
    return JSON.parse(raw) as StoredUserData;
  } catch (error) {
    console.warn('authStorage: no se pudo parsear user_data de localStorage', error);
    return null;
  }
}
