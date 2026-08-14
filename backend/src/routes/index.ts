import { Router } from 'express';

import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import githubScanRoutes from './githubScan.routes';
import healthRoutes from './health.routes';
import projectRoutes from './project.routes';
import scanRoutes from './scan.routes';

const router = Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use(projectRoutes);
router.use(githubScanRoutes);
router.use(scanRoutes);
router.use(dashboardRoutes);

export default router;