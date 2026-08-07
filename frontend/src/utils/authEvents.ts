export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function emitUnauthorized(): void {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}