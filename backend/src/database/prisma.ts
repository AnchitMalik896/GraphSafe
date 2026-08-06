import { PrismaClient, Prisma } from '@prisma/client';

import { config } from '../config';

export const prisma = new PrismaClient({
  log: config.isDevelopment ? ['warn', 'error'] : ['error'],
});

export type DbClient = PrismaClient | Prisma.TransactionClient;