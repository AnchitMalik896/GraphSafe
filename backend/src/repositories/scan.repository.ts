import type { Prisma, Scan } from '@prisma/client';

import { prisma, type DbClient } from '../database/prisma';

export const scanRepository = {
  async findById(id: string): Promise<Scan | null> {
    return prisma.scan.findUnique({ where: { id } });
  },

  async findManyByProjectId(projectId: string): Promise<Scan[]> {
    return prisma.scan.findMany({ where: { projectId } });
  },

  async create(data: Prisma.ScanCreateInput): Promise<Scan> {
    return prisma.scan.create({ data });
  },

 
  async update(id: string, data: Prisma.ScanUpdateInput, client: DbClient = prisma): Promise<Scan> {
    return client.scan.update({ where: { id }, data });
  },
};