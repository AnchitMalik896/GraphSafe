import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required').max(100, 'Name is too long'),
  repositoryUrl: z
    .string()
    .trim()
    .min(1, 'Repository URL is required')
    .url('Enter a valid URL')
    .max(500, 'URL is too long'),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;