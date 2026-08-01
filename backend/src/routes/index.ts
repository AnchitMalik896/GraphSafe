import { Router } from 'express';

import healthRoutes from './health.routes';

/**
 * Aggregates all v1 routes. New feature routers should be registered
 * here as they are added (e.g. auth.routes, projects.routes).
 */
const router = Router();

router.use(healthRoutes);

export default router;
