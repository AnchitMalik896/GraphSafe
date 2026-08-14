import { api } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { GithubScanRequestBody, GithubScanResult } from '@/types/scan';
import type { ScanDetails } from '@/types/scanDetails';

export const scanService = {
  async runGithubScan(projectId: string, payload: GithubScanRequestBody): Promise<GithubScanResult> {
    const { data } = await api.post<ApiSuccessResponse<GithubScanResult>>(
      `/projects/${projectId}/github-scan`,
      payload,
    );
    return data.data;
  },

  async getScanDetails(projectId: string, scanId: string): Promise<ScanDetails> {
    const { data } = await api.get<ApiSuccessResponse<ScanDetails>>(
      `/projects/${projectId}/scans/${scanId}`,
    );
    return data.data;
  },
};