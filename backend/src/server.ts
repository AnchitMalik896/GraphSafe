import type { Server } from 'http';

import { createApp } from './app';
import { config } from './config';
import { prisma } from './database/prisma';

async function main(): Promise<void> {
  // Fail fast if the database is unreachable before accepting traffic.
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log('Database connection established.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }

  const app = createApp();

  const server: Server = app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(
      `GraphSafe backend listening on port ${config.port} [${config.env}] — ${config.apiPrefix}/health`,
    );
  });

  let isShuttingDown = false;

  /**
   * Shared graceful shutdown routine used by both OS signals (clean exit)
   * and process-level crash events (non-zero exit). `isShuttingDown`
   * ensures it only ever runs once, no matter which trigger fires first.
   */
  async function shutdown(reason: string, exitCode = 0): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    // eslint-disable-next-line no-console
    console.log(`Received ${reason}. Shutting down gracefully...`);

    server.close(async (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Error while closing HTTP server:', err);
      }

      try {
        await prisma.$disconnect();
        // eslint-disable-next-line no-console
        console.log('Database connection closed. Goodbye.');
        process.exit(err ? 1 : exitCode);
      } catch (disconnectError) {
        // eslint-disable-next-line no-console
        console.error('Error while disconnecting Prisma:', disconnectError);
        process.exit(1);
      }
    });

    // Force-exit if shutdown hangs.
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  // Process-level safety nets. Anything that escapes the Express request
  // lifecycle (a stray rejected promise, a synchronous throw outside a
  // request handler) ends up here instead of crashing the process raw or
  // leaving it running in a corrupted state. Both funnel into the same
  // shutdown routine used by SIGINT/SIGTERM, but always exit non-zero.
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled promise rejection:', reason);
    void shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (error) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught exception:', error);
    void shutdown('uncaughtException', 1);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
