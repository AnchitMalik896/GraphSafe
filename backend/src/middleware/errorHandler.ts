import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { config } from '../config';
import type { ApiErrorResponse } from '../types/api';
import { AppError } from '../utils/AppError';

/**
 * Single place where every error in the application is converted into
 * a consistent JSON response. Keep this the ONLY place that formats
 * error output so the API surface stays predictable.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown[] | undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = config.isProduction ? 'Internal server error' : err.message;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(`[${req.requestId ?? 'no-request-id'}]`, err);
  }

  const body: ApiErrorResponse = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
  };

  res.status(statusCode).json(body);
}
