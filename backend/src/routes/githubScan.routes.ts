import { Router } from 'express';

import { runGithubScan } from '../controllers/githubScan.controller';
import { authenticate } from '../middleware/auth';
import { githubScanBodySchema, githubScanParamsSchema } from '../validators/githubScan.validator';
import { validate } from '../validators/validate';

const router = Router();

router.post(
  '/projects/:projectId/github-scan',
  authenticate,
  validate({ params: githubScanParamsSchema, body: githubScanBodySchema }),
  runGithubScan,
);

export default router;