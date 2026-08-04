import type { Prisma, RiskReport } from '@prisma/client';

import { prisma } from '../database/prisma';

/**
 * Data access for the RiskReport model. Computing the actual risk
 * scores is out of scope for this phase and will live in the future
 * risk engine service.
 */
export const riskReportRepository = {
  async findByScanId(scanId: string): Promise<RiskReport | null> {
    return prisma.riskReport.findUnique({ where: { scanId } });
  },

  async create(data: Prisma.RiskReportCreateInput): Promise<RiskReport> {
    return prisma.riskReport.create({ data });
  },

   async findByScanIds(scanIds: string[]): Promise<RiskReport[]> {
    if (scanIds.length === 0) {
      return [];
    }
    return prisma.riskReport.findMany({
      where: { scanId: { in: scanIds } },
      orderBy: { generatedAt: 'desc' },
    });
  },
};
