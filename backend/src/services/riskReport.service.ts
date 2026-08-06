import type { RiskReport } from '@prisma/client';

import { riskReportRepository } from '../repositories/riskReport.repository';

export interface CreateRiskReportInput {
  scanId: string;
  vulnerablePackages: number;
  outdatedPackages: number;
  deprecatedPackages: number;
  overallRiskScore: number;
}


export const riskReportService = {
  async createReport(input: CreateRiskReportInput): Promise<RiskReport> {
    return riskReportRepository.create({
      scan: { connect: { id: input.scanId } },
      vulnerablePackages: input.vulnerablePackages,
      outdatedPackages: input.outdatedPackages,
      deprecatedPackages: input.deprecatedPackages,
      overallRiskScore: input.overallRiskScore,
    });
  },
};