import { api } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { DashboardStatsDTO } from '@/types/dashboard';

export const dashboardService = {
  async getStats(): Promise<DashboardStatsDTO> {
    const { data } = await api.get<ApiSuccessResponse<DashboardStatsDTO>>('/dashboard');
    return data.data;
  },
};