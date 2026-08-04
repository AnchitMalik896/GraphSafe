import type { Dependency } from '@prisma/client';

import { dependencyRepository } from '../repositories/dependency.repository';
import { scanRepository } from '../repositories/scan.repository';
import { riskRules } from '../rules';
import type { AnalyzableDependency, RiskAnalysisReport, RiskFinding } from '../types/risk';
import { AppError } from '../utils/AppError';


function toAnalyzableDependency(dependency: Dependency): AnalyzableDependency {
  return {
    packageName: dependency.packageName,
    version: dependency.version,
    latestVersion: dependency.latestVersion,
    vulnerable: dependency.vulnerable,
    deprecated: dependency.deprecated,
    popularityScore: dependency.popularityScore,
  };
}


export const riskAnalysisService = {
  async analyzeScan(scanId: string): Promise<RiskAnalysisReport> {
    const scan = await scanRepository.findById(scanId);
    if (!scan) {
      throw AppError.notFound('Scan not found');
    }

    const dependencies = await dependencyRepository.findByScan(scanId);
    const analyzableDependencies = dependencies.map(toAnalyzableDependency);

    const findings: RiskFinding[] = riskRules.flatMap((rule) =>
      rule.evaluate(analyzableDependencies),
    );

    return {
      totalDependencies: dependencies.length,
      totalFindings: findings.length,
      findings,
      generatedAt: new Date(),
    };
  },
};