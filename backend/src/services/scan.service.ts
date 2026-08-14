import type { Dependency, RiskReport, Scan } from '@prisma/client';

import { dependencyRepository } from '../repositories/dependency.repository';
import { riskReportRepository } from '../repositories/riskReport.repository';
import { scanRepository } from '../repositories/scan.repository';
import type { DependencyDto, RiskReportDto, ScanDetailsDto, ScanDto } from '../types/scanDetails';
import { AppError } from '../utils/AppError';
import { getProject } from './project.service';

/** Explicit allow-lists — same pattern as toSafeUser — so a future
 * field added to a Prisma model doesn't leak through by accident. */

function toScanDto(scan: Scan): ScanDto {
  return {
    id: scan.id,
    projectId: scan.projectId,
    status: scan.status,
    riskScore: scan.riskScore,
    scannedAt: scan.scannedAt,
    createdAt: scan.createdAt,
    completedAt: scan.completedAt,
    manifestFiles: scan.manifestFiles,
    ecosystems: scan.ecosystems,
  };
}

function toRiskReportDto(riskReport: RiskReport): RiskReportDto {
  return {
    vulnerablePackages: riskReport.vulnerablePackages,
    outdatedPackages: riskReport.outdatedPackages,
    deprecatedPackages: riskReport.deprecatedPackages,
    overallRiskScore: riskReport.overallRiskScore,
    riskLevel: riskReport.riskLevel,
    totalFindings: riskReport.totalFindings,
    generatedAt: riskReport.generatedAt,
  };
}

function toDependencyDto(dependency: Dependency): DependencyDto {
  return {
    id: dependency.id,
    packageName: dependency.packageName,
    version: dependency.version,
    latestVersion: dependency.latestVersion,
    vulnerable: dependency.vulnerable,
    deprecated: dependency.deprecated,
    popularityScore: dependency.popularityScore,
  };
}

export const scanService = {
  /**
   * Fully backed by already-persisted data (Scan, RiskReport,
   * Dependency) — no findings are recomputed here. Ownership is
   * enforced by reusing project.service's existing 404-not-403
   * pattern; a scan belonging to a different project is treated the
   * same as a missing scan so we never leak its existence.
   */
  async getScanDetails(userId: string, projectId: string, scanId: string): Promise<ScanDetailsDto> {
    await getProject(userId, projectId);

    const scan = await scanRepository.findById(scanId);
    if (!scan || scan.projectId !== projectId) {
      throw AppError.notFound('Scan not found');
    }

    const [riskReport, dependencies] = await Promise.all([
      riskReportRepository.findByScanId(scan.id),
      dependencyRepository.findByScan(scan.id),
    ]);

    return {
      scan: toScanDto(scan),
      riskReport: riskReport ? toRiskReportDto(riskReport) : null,
      dependencies: dependencies.map(toDependencyDto),
    };
  },
};