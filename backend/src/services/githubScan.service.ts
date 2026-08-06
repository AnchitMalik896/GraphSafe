import type { Dependency, Scan } from '@prisma/client';
import { readFile } from 'fs/promises';
import path from 'path';

import { EmptyManifestError, InvalidPackageJsonError } from '../parsers/parser.errors';
import { packageParser } from '../parsers/packageParser';
import { dependencyRepository } from '../repositories/dependency.repository';
import { scanRepository } from '../repositories/scan.repository';
import type { GithubScanResultDto } from '../types/githubScan';
import type { RiskScoringResult } from '../types/scoring';
import { AppError } from '../utils/AppError';
import { cloneRepository, validateRepositoryUrl } from './github.service';
import { getProject } from './project.service';
import { riskAnalysisService } from './riskAnalysis.service';
import { riskReportService } from './riskReport.service';
import { riskScoringService } from './riskScoring.service';
import { createWorkspace, removeWorkspace } from './workspace.service';

const PACKAGE_MANIFEST_FILENAME = 'package.json';

interface DependencyRiskCounts {
  vulnerablePackages: number;
  outdatedPackages: number;
  deprecatedPackages: number;
}

function countDependencyRiskCategories(dependencies: Dependency[]): DependencyRiskCounts {
  return dependencies.reduce<DependencyRiskCounts>(
    (counts, dependency) => ({
      vulnerablePackages: counts.vulnerablePackages + (dependency.vulnerable ? 1 : 0),
      deprecatedPackages: counts.deprecatedPackages + (dependency.deprecated ? 1 : 0),
      outdatedPackages:
        counts.outdatedPackages +
        (dependency.latestVersion !== null && dependency.latestVersion !== dependency.version ? 1 : 0),
    }),
    { vulnerablePackages: 0, outdatedPackages: 0, deprecatedPackages: 0 },
  );
}

function toGithubScanResultDto(params: {
  scan: Scan;
  dependencyCount: number;
  scoring: RiskScoringResult;
  generatedAt: Date;
}): GithubScanResultDto {
  return {
    scanId: params.scan.id,
    dependencyCount: params.dependencyCount,
    totalFindings: params.scoring.totalFindings,
    overallRiskScore: params.scoring.overallRiskScore,
    riskLevel: params.scoring.riskLevel,
    generatedAt: params.generatedAt.toISOString(),
  };
}

/** Best-effort — never lets a secondary failure mask the original error. */
async function markScanFailed(scanId: string): Promise<void> {
  try {
    await scanRepository.update(scanId, { status: 'FAILED', completedAt: new Date() });
  } catch {
    // Intentionally swallowed.
  }
}

export const githubScanService = {
  async runScan(userId: string, projectId: string, repositoryUrl: string): Promise<GithubScanResultDto> {
    // Ownership check reuses project.service's existing 404-not-403 logic.
    const project = await getProject(userId, projectId);

    // Fail fast, before allocating a workspace, on an obviously bad URL.
    validateRepositoryUrl(repositoryUrl);

    const workspacePath = await createWorkspace();
    let scan: Scan | undefined;

    try {
      await cloneRepository(repositoryUrl, workspacePath);

      const manifestPath = path.join(workspacePath, PACKAGE_MANIFEST_FILENAME);
      let manifestRaw: string;
      try {
        manifestRaw = await readFile(manifestPath, 'utf-8');
      } catch {
        throw AppError.badRequest(
          `Repository does not contain a ${PACKAGE_MANIFEST_FILENAME} at its root`,
        );
      }

      let parsedDependencies;
      try {
        parsedDependencies = packageParser.parse(manifestRaw);
      } catch (error) {
        if (error instanceof EmptyManifestError || error instanceof InvalidPackageJsonError) {
          throw AppError.badRequest(error.message);
        }
        throw error;
      }

      scan = await scanRepository.create({
        project: { connect: { id: project.id } },
        status: 'RUNNING',
        manifestFiles: [PACKAGE_MANIFEST_FILENAME],
        ecosystems: ['npm'],
      });

      await dependencyRepository.createMany(scan.id, parsedDependencies);

      const analysisReport = await riskAnalysisService.analyzeScan(scan.id);
      const scoringResult = riskScoringService.computeRiskScore(analysisReport);

      const persistedDependencies = await dependencyRepository.findByScan(scan.id);
      const categoryCounts = countDependencyRiskCategories(persistedDependencies);

      const riskReport = await riskReportService.createReport({
        scanId: scan.id,
        ...categoryCounts,
        overallRiskScore: scoringResult.overallRiskScore,
      });

      const completedAt = new Date();
      await scanRepository.update(scan.id, {
        status: 'COMPLETED',
        riskScore: scoringResult.overallRiskScore,
        scannedAt: completedAt,
        completedAt,
      });

      return toGithubScanResultDto({
        scan,
        dependencyCount: parsedDependencies.length,
        scoring: scoringResult,
        generatedAt: riskReport.generatedAt,
      });
    } catch (error) {
      if (scan) {
        await markScanFailed(scan.id);
      }
      throw error;
    } finally {
      await removeWorkspace(workspacePath);
    }
  },
};