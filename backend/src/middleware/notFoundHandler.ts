import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError';

/**
 * Catches any request that did not match a defined route and forwards
 * a consistent 404 AppError to the global error handler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
