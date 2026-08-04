import type { Dependency, Prisma } from '@prisma/client';

import { prisma } from '../database/prisma';
import type { ParsedDependency } from '../parsers/parser.types';

export interface CreateManyDependenciesResult {
  count: number;
}

function toDependencyCreateInput(
  scanId: string,
  dependency: ParsedDependency,
): Prisma.DependencyCreateManyInput {
  return {
    scanId,
    packageName: dependency.name,
    version: dependency.version,
  };
}
export const dependencyRepository = {
  
  createMany(scanId: string, dependencies: ParsedDependency[]): Promise<CreateManyDependenciesResult> {
    if (dependencies.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return prisma.dependency.createMany({
      data: dependencies.map((dependency) => toDependencyCreateInput(scanId, dependency)),
    });
  },

  findByScan(scanId: string): Promise<Dependency[]> {
    return prisma.dependency.findMany({ where: { scanId } });
  },

  countByScan(scanId: string): Promise<number> {
    return prisma.dependency.count({ where: { scanId } });
  },

  deleteByScan(scanId: string): Promise<{ count: number }> {
    return prisma.dependency.deleteMany({ where: { scanId } });
  },

   async countByScanIds(scanIds: string[]): Promise<Map<string, number>> {
    if (scanIds.length === 0) {
      return new Map();
    }

    const grouped = await prisma.dependency.groupBy({
      by: ['scanId'],
      where: { scanId: { in: scanIds } },
      _count: { _all: true },
    });

    return new Map(grouped.map((row) => [row.scanId, row._count._all]));
  },
};