// backend/src/repositories/riskReport.repository.ts
import type { Prisma, RiskReport } from '@prisma/client';

import { prisma, type DbClient } from '../database/prisma';

export const riskReportRepository = {
  async findByScanId(scanId: string, client: DbClient = prisma): Promise<RiskReport | null> {
    return client.riskReport.findUnique({ where: { scanId } });
  },

  
  async findByScanIds(scanIds: string[], client: DbClient = prisma): Promise<RiskReport[]> {
    if (scanIds.length === 0) {
      return [];
    }

    return client.riskReport.findMany({
      where: { scanId: { in: scanIds } },
      orderBy: { generatedAt: 'desc' },
    });
  },

  async create(data: Prisma.RiskReportCreateInput, client: DbClient = prisma): Promise<RiskReport> {
    return client.riskReport.create({ data });
  },
};