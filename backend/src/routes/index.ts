import { Router } from 'express';

import authRoutes from './auth.routes';
import healthRoutes from './health.routes';
import projectRoutes from './project.routes';

/**
 * Aggregates all v1 routes. New feature routers should be registered
 * here as they are added (e.g. projects.routes).
 */
const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use(projectRoutes);

export default router;