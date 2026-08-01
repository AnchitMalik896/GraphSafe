import type { NextFunction, Request, Response } from 'express';

import { userRepository } from '../repositories/user.repository';
import type { SafeUser } from '../types/auth';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';
import { toSafeUser } from '../utils/toSafeUser';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

/**
 * Reusable JWT authentication middleware. Reads the `Authorization:
 * Bearer <token>` header, verifies it, loads the corresponding user,
 * and attaches it (without `passwordHash`) to `req.user`.
 *
 * Any protected route should simply add this as a route-level
 * middleware, e.g. `router.get('/me', authenticate, getMe)`.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or malformed Authorization header');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw AppError.unauthorized('Missing authentication token');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw AppError.unauthorized('Invalid or expired token');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw AppError.unauthorized('Invalid or expired token');
    }

    req.user = toSafeUser(user);
    next();
  } catch (error) {
    next(error);
  }
}
