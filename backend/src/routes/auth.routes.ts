import { Router } from 'express';

import { getMe, login, register } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { loginSchema } from '../validators/auth/login.schema';
import { registerSchema } from '../validators/auth/register.schema';
import { validate } from '../validators/validate';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.get('/me', authenticate, getMe);

export default router;
