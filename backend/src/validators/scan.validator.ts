import { z } from 'zod';

export const scanParamsSchema = z.object({
  projectId: z.string().uuid('Project id must be a valid UUID'),
  scanId: z.string().uuid('Scan id must be a valid UUID'),
});

export type ScanParamsInput = z.infer<typeof scanParamsSchema>;