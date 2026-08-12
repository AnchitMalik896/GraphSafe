import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { scanService } from '@/services/scan.service';
import type { GithubScanRequestBody } from '@/types/scan';

export function useGithubScan(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GithubScanRequestBody) => scanService.runGithubScan(projectId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
}