import { prisma, type DbClient } from './prisma';

export function withTransaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn);
}