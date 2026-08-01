import type { Dependency, Prisma } from '@prisma/client';

import { prisma } from '../database/prisma';

/**
 * Data access for the Dependency model. Parsing package manifests and
 * populating dependencies is out of scope for this phase and will live
 * in a dependency parser service in a later phase.
 */
export const dependencyRepository = {
  async findManyByScanId(scanId: string): Promise<Dependency[]> {
    return prisma.dependency.findMany({ where: { scanId } });
  },

  async createMany(data: Prisma.DependencyCreateManyInput[]): Promise<{ count: number }> {
    return prisma.dependency.createMany({ data });
  },
};
