import type { Request } from 'express';

import type { SafeUser } from '../types/auth';
import { AppError } from './AppError';

export function requireUser(req: Request): SafeUser {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}