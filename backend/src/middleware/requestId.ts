import { randomUUID } from 'crypto';

import type { NextFunction, Request, Response } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Attaches a unique ID to every incoming request and echoes it back
 * on the response header, useful for tracing a request through logs.
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header('X-Request-Id');
  req.requestId = incomingId && incomingId.length > 0 ? incomingId : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}
