import type { RiskLevel, RiskReport } from '@prisma/client';

import type { DbClient } from '../database/prisma';
import { riskReportRepository } from '../repositories/riskReport.repository';

export interface CreateRiskReportInput {
  scanId: string;
  vulnerablePackages: number;
  outdatedPackages: number;
  deprecatedPackages: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  totalFindings: number;
}

export const riskReportService = {
  async createReport(input: CreateRiskReportInput, client?: DbClient): Promise<RiskReport> {
    return riskReportRepository.create(
      {
        scan: { connect: { id: input.scanId } },
        vulnerablePackages: input.vulnerablePackages,
        outdatedPackages: input.outdatedPackages,
        deprecatedPackages: input.deprecatedPackages,
        overallRiskScore: input.overallRiskScore,
        riskLevel: input.riskLevel,
        totalFindings: input.totalFindings,
      },
      client,
    );
  },
};