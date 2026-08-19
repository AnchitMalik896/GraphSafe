import type { Finding, Prisma } from '@prisma/client';

import { prisma, type DbClient } from '../database/prisma';

/**
 * Data access for the Finding model. No business logic — normalization,
 * severity mapping, and risk-score math belong in vulnerability.service.ts.
 * Follows the same DbClient-parameter pattern as scan.repository.ts and
 * riskReport.repository.ts so callers can optionally pass a transaction
 * client.
 */
export const findingRepository = {
  async createMany(
    data: Prisma.FindingCreateManyInput[],
    client: DbClient = prisma,
  ): Promise<{ count: number }> {
    if (data.length === 0) {
      return { count: 0 };
    }

    return client.finding.createMany({ data });
  },

  async findByScan(scanId: string, client: DbClient = prisma): Promise<Finding[]> {
    return client.finding.findMany({ where: { scanId } });
  },

  async findByDependency(dependencyId: string, client: DbClient = prisma): Promise<Finding[]> {
    return client.finding.findMany({ where: { dependencyId } });
  },

  async countByScan(scanId: string, client: DbClient = prisma): Promise<number> {
    return client.finding.count({ where: { scanId } });
  },

  async deleteByScan(scanId: string, client: DbClient = prisma): Promise<{ count: number }> {
    return client.finding.deleteMany({ where: { scanId } });
  },
};