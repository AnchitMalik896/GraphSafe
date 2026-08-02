import { Router } from 'express';

import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import {
  createProjectSchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from '../validators/project.validator';
import { validate } from '../validators/validate';

const router = Router();

// Every project route requires authentication.
router.use('/projects', authenticate);

router.post('/projects', validate({ body: createProjectSchema }), createProject);
router.get('/projects', listProjects);
router.get('/projects/:id', validate({ params: projectIdParamsSchema }), getProject);
router.patch(
  '/projects/:id',
  validate({ params: projectIdParamsSchema, body: updateProjectSchema }),
  updateProject,
);
router.delete('/projects/:id', validate({ params: projectIdParamsSchema }), deleteProject);

export default router;