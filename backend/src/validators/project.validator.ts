import { z } from 'zod';

const githubRepositoryUrlSchema = z
  .string()
  .trim()
  .max(500, 'Repository URL must be at most 500 characters')
  .url('Repository URL must be a valid URL')
  .superRefine((value, ctx) => {
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Repository URL must be a valid URL' });
      return;
    }

    const host = parsed.hostname.toLowerCase();
    if (host !== 'github.com' && host !== 'www.github.com') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Repository URL must be a github.com repository',
      });
      return;
    }

    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    if (pathSegments.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Repository URL must include an owner and repository name (e.g. github.com/owner/repo)',
      });
    }
  });

const projectNameSchema = z
  .string()
  .trim()
  .min(1, 'Project name is required')
  .max(100, 'Project name must be at most 100 characters');

export const createProjectSchema = z.object({
  name: projectNameSchema,
  repositoryUrl: githubRepositoryUrlSchema,
});

export const updateProjectSchema = z
  .object({
    name: projectNameSchema.optional(),
    repositoryUrl: githubRepositoryUrlSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.repositoryUrl !== undefined, {
    message: 'At least one of name or repositoryUrl must be provided',
  });

export const projectIdParamsSchema = z.object({
  id: z.string().uuid('Project id must be a valid UUID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;