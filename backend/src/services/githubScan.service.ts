import type { Dependency, Scan } from '@prisma/client';
import { readFile } from 'fs/promises';
import path from 'path';

import { withTransaction } from '../database/transaction';
import { EmptyManifestError, InvalidPackageJsonError } from '../parsers/parser.errors';
import { packageParser } from '../parsers/packageParser';
import type { ParsedDependency } from '../parsers/parser.types';
import { dependencyRepository } from '../repositories/dependency.repository';
import { scanRepository } from '../repositories/scan.repository';
import type { GithubScanResultDto } from '../types/githubScan';
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

async function readAndParseManifest(workspacePath: string): Promise<ParsedDependency[]> {
  const manifestPath = path.join(workspacePath, PACKAGE_MANIFEST_FILENAME);

  let manifestRaw: string;
  try {
    manifestRaw = await readFile(manifestPath, 'utf-8');
  } catch {
    throw AppError.badRequest(`Repository does not contain a ${PACKAGE_MANIFEST_FILENAME} at its root`);
  }

  try {
    return packageParser.parse(manifestRaw);
  } catch (error) {
    if (error instanceof EmptyManifestError || error instanceof InvalidPackageJsonError) {
      throw AppError.badRequest(error.message);
    }
    throw error;
  }
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


async function scoreAndCompleteScan(scan: Scan) {
  const analysisReport = await riskAnalysisService.analyzeScan(scan.id);
  const scoringResult = riskScoringService.computeRiskScore(analysisReport);

  const persistedDependencies = await dependencyRepository.findByScan(scan.id);
  const categoryCounts = countDependencyRiskCategories(persistedDependencies);

  return withTransaction(async (tx) => {
    const riskReport = await riskReportService.createReport(
      {
        scanId: scan.id,
        ...categoryCounts,
        overallRiskScore: scoringResult.overallRiskScore,
        riskLevel: scoringResult.riskLevel,
        totalFindings: scoringResult.totalFindings,
      },
      tx,
    );

    const completedAt = new Date();
    await scanRepository.update(
      scan.id,
      { status: 'COMPLETED', riskScore: scoringResult.overallRiskScore, scannedAt: completedAt, completedAt },
      tx,
    );

    return riskReport;
  });
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

      const parsedDependencies = await readAndParseManifest(workspacePath);

      scan = await scanRepository.create({
        project: { connect: { id: project.id } },
        status: 'RUNNING',
        manifestFiles: [PACKAGE_MANIFEST_FILENAME],
        ecosystems: ['npm'],
      });

      await dependencyRepository.createMany(scan.id, parsedDependencies);

      const riskReport = await scoreAndCompleteScan(scan);

      return {
        scanId: scan.id,
        dependencyCount: parsedDependencies.length,
        totalFindings: riskReport.totalFindings,
        overallRiskScore: riskReport.overallRiskScore,
        riskLevel: riskReport.riskLevel,
        generatedAt: riskReport.generatedAt.toISOString(),
      };
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