import { api } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { LoginResponseData, MeResponseData, RegisterResponseData, User } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<ApiSuccessResponse<RegisterResponseData>>(
      '/auth/register',
      payload,
    );
    return data.data.user;
  },

  async login(payload: LoginPayload): Promise<LoginResponseData> {
    const { data } = await api.post<ApiSuccessResponse<LoginResponseData>>('/auth/login', payload);
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best-effort — client-side state is cleared regardless.
    }
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<ApiSuccessResponse<MeResponseData>>('/auth/me');
    return data.data.user;
  },
};