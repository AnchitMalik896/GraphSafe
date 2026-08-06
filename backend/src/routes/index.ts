import { Router } from 'express';

import authRoutes from './auth.routes';
import githubScanRoutes from './githubScan.routes';
import healthRoutes from './health.routes';
import projectRoutes from './project.routes';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use(projectRoutes);
router.use(githubScanRoutes);

export default router;