import { Router } from 'express';

import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import healthRoutes from './health.routes';
import projectRoutes from './project.routes';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use(projectRoutes);
router.use(dashboardRoutes);

export default router;