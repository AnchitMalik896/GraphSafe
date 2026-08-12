export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
  },
} as const;