import axios from 'axios';

import type { ApiErrorResponse } from '@/types/api';

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return 'Network error. Please check your connection.';
    }
    return error.response.data?.message ?? fallback;
  }
  return fallback;
}