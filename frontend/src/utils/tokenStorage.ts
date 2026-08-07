import { STORAGE_KEYS } from '@/constants/storage';

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN) ?? sessionStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string, remember: boolean): void {
  clearToken();
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
  }
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
}