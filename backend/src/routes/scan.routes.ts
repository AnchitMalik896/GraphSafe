import { Router } from 'express';

import { getScanDetails } from '../controllers/scan.controller';
import { authenticate } from '../middleware/auth';
import { scanParamsSchema } from '../validators/scan.validator';
import { validate } from '../validators/validate';

const router = Router();

router.get(
  '/projects/:projectId/scans/:scanId',
  authenticate,
  validate({ params: scanParamsSchema }),
  getScanDetails,
);

export default router;