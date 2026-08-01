import cors from 'cors';
import express, { type Express, type Request } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestId } from './middleware/requestId';
import routes from './routes';

// Correlate every access log line with the request ID set by the
// requestId middleware, so logs can be traced back to a single request.
// Morgan's token callback types its argument as Node's IncomingMessage;
// cast to Express's Request to reach the `requestId` field added by
// the requestId middleware's type augmentation.
morgan.token('id', (req) => (req as Request).requestId ?? '-');

const morganFormat = config.isDevelopment
  ? '[:id] :method :url :status :response-time ms'
  : '[:id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Builds and configures the Express application.
 * Does NOT start listening — that is server.ts's job — which keeps
 * this file testable in isolation (e.g. with supertest) later on.
 */
export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    }),
  );

  // Request tracing — must run before Morgan so :id is available to log
  app.use(requestId);

  // Request logging — runs before body parsing so malformed JSON bodies
  // (which express.json() rejects) are still captured in access logs
  app.use(morgan(morganFormat));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use(config.apiPrefix, routes);

  // 404 handler — must come after all valid routes
  app.use(notFoundHandler);

  // Global error handler — must be registered last
  app.use(errorHandler);

  return app;
}
