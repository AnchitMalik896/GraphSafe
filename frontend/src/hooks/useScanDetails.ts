import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { scanService } from '@/services/scan.service';

export function useScanDetails(projectId: string | undefined, scanId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.scans.detail(projectId ?? '', scanId ?? ''),
    queryFn: () => scanService.getScanDetails(projectId as string, scanId as string),
    enabled: Boolean(projectId) && Boolean(scanId),
  });
}