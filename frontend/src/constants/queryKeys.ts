export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
  },
  scans: {
    detail: (projectId: string, scanId: string) =>
      ['projects', projectId, 'scans', scanId] as const,
  },
} as const;