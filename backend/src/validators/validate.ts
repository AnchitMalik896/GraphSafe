import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Reusable validation middleware factory. Pass Zod schemas for any of
 * body/query/params and this will parse + replace them on `req`,
 * forwarding any ZodError to the global error handler.
 *
 * No application-specific schemas are defined yet; this is
 * infrastructure only, ready for future features.
 *
 * Example (future usage):
 *   router.post('/users', validate({ body: createUserSchema }), controller);
 */
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
