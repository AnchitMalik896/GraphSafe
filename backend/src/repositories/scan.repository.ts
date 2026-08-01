import type { Prisma, Scan } from '@prisma/client';

import { prisma } from '../database/prisma';

/**
 * Data access for the Scan model. Scan orchestration (running the
 * dependency parser, computing risk scores, etc.) is out of scope for
 * this phase and will live in scan.service.ts when it is introduced.
 */
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
};
