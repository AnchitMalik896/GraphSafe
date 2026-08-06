import type { Prisma, RiskReport } from '@prisma/client';

import { prisma, type DbClient } from '../database/prisma';

export const riskReportRepository = {
  async findByScanId(scanId: string, client: DbClient = prisma): Promise<RiskReport | null> {
    return client.riskReport.findUnique({ where: { scanId } });
  },

  async create(data: Prisma.RiskReportCreateInput, client: DbClient = prisma): Promise<RiskReport> {
    return client.riskReport.create({ data });
  },
};