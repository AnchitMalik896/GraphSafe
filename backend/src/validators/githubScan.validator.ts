import { z } from 'zod';

import { githubRepositoryUrlSchema } from './project.validator';

export const githubScanBodySchema = z.object({
  repositoryUrl: githubRepositoryUrlSchema,
});

export const githubScanParamsSchema = z.object({
  projectId: z.string().uuid('Project id must be a valid UUID'),
});

export type GithubScanBodyInput = z.infer<typeof githubScanBodySchema>;