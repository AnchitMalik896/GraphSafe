import { api } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { GithubScanRequestBody, GithubScanResult } from '@/types/scan';

export const scanService = {
  async runGithubScan(projectId: string, payload: GithubScanRequestBody): Promise<GithubScanResult> {
    const { data } = await api.post<ApiSuccessResponse<GithubScanResult>>(
      `/projects/${projectId}/github-scan`,
      payload,
    );
    return data.data;
  },
};