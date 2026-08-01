import { PrismaClient } from '@prisma/client';

import { config } from '../config';

/**
 * Single shared Prisma client instance for the whole application.
 * Repositories and services should import `prisma` from here instead
 * of instantiating their own PrismaClient.
 */
export const prisma = new PrismaClient({
  log: config.isDevelopment ? ['warn', 'error'] : ['error'],
});
