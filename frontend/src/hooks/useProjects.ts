import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import { projectService } from '@/services/project.service';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: projectService.listProjects,
  });
}