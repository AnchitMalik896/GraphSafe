import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';

/**
 * Aggregates all v1 routes. New feature routers should be registered
 * here as they are added (e.g. projects.routes).
 */
const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);

export default router;
