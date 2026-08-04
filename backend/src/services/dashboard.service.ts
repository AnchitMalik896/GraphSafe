import type { Project, RiskReport, Scan } from '@prisma/client';

import { AVERAGE_SCORE_DECIMAL_PLACES, RECENT_SCANS_LIMIT } from './dashboard.constants';
import { determineRiskLevel } from './riskLevel.util';
import { dependencyRepository } from '../repositories/dependency.repository';
import { projectRepository } from '../repositories/project.repository';
import { riskReportRepository } from '../repositories/riskReport.repository';
import { scanRepository } from '../repositories/scan.repository';
import type {
  DashboardStatsDTO,
  ProjectSummaryDTO,
  RecentScanActivityDTO,
  RiskDistribution,
} from '../types/dashboard';

const EMPTY_RISK_DISTRIBUTION: RiskDistribution = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };

/** A `ProjectSummaryDTO` narrowed to only the projects that have a score. */
type ScoredProjectSummary = ProjectSummaryDTO & { latestRiskScore: number };

function isScored(summary: ProjectSummaryDTO): summary is ScoredProjectSummary {
  return summary.latestRiskScore !== null;
}

/**
 * Reduces a pre-sorted (descending) array down to one entry per key —
 * the first occurrence of each key, which is the most recent given the
 * descending order. Used to pick "the latest scan per project" and
 * "the latest RiskReport per scan" from a single batched query result,
 * instead of a second round-trip per group.
 */
function keepFirstPerKey<T>(items: T[], keyFn: (item: T) => string): Map<string, T> {
  const result = new Map<string, T>();
  for (const item of items) {
    const key = keyFn(item);
    if (!result.has(key)) {
      result.set(key, item);
    }
  }
  return result;
}

function roundTo(value: number, decimalPlaces: number): number {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

function buildProjectSummary(
  project: Project,
  latestScan: Scan | undefined,
  latestRiskReportByScanId: Map<string, RiskReport>,
  dependencyCountByScanId: Map<string, number>,
): ProjectSummaryDTO {
  if (!latestScan) {
    return {
      projectId: project.id,
      projectName: project.name,
      latestScanId: null,
      latestRiskScore: null,
      latestRiskLevel: null,
      dependencyCount: 0,
      lastScannedAt: null,
    };
  }

  const riskReport = latestRiskReportByScanId.get(latestScan.id) ?? null;

  return {
    projectId: project.id,
    projectName: project.name,
    latestScanId: latestScan.id,
    latestRiskScore: riskReport?.overallRiskScore ?? null,
    latestRiskLevel: riskReport ? determineRiskLevel(riskReport.overallRiskScore) : null,
    dependencyCount: dependencyCountByScanId.get(latestScan.id) ?? 0,
    lastScannedAt: latestScan.completedAt ?? null,
  };
}

function computeRiskDistribution(summaries: ProjectSummaryDTO[]): RiskDistribution {
  const distribution: RiskDistribution = { ...EMPTY_RISK_DISTRIBUTION };
  for (const summary of summaries) {
    if (summary.latestRiskLevel) {
      distribution[summary.latestRiskLevel] += 1;
    }
  }
  return distribution;
}

function pickExtremeProject(
  scoredSummaries: ScoredProjectSummary[],
  isBetter: (candidateScore: number, currentBestScore: number) => boolean,
): ScoredProjectSummary | null {
  if (scoredSummaries.length === 0) {
    return null;
  }
  return scoredSummaries.reduce((best, current) =>
    isBetter(current.latestRiskScore, best.latestRiskScore) ? current : best,
  );
}

/**
 * Builds the recent-activity feed from ALL scans (not just each
 * project's latest), keeping only scans that both completed and have a
 * matching persisted `RiskReport`. A completed scan whose scoring step
 * never ran or failed is intentionally excluded rather than shown with
 * a fabricated score — see Phase 5C review notes.
 */
function buildRecentScans(
  scans: Scan[],
  projectNameById: Map<string, string>,
  latestRiskReportByScanId: Map<string, RiskReport>,
): RecentScanActivityDTO[] {
  const entries: RecentScanActivityDTO[] = [];

  for (const scan of scans) {
    if (!scan.completedAt) continue;

    const riskReport = latestRiskReportByScanId.get(scan.id);
    const projectName = projectNameById.get(scan.projectId);
    if (!riskReport || !projectName) continue;

    entries.push({
      scanId: scan.id,
      projectId: scan.projectId,
      projectName,
      completedAt: scan.completedAt,
      overallRiskScore: riskReport.overallRiskScore,
      riskLevel: determineRiskLevel(riskReport.overallRiskScore),
    });
  }

  return entries
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    .slice(0, RECENT_SCANS_LIMIT);
}

function emptyDashboard(): DashboardStatsDTO {
  return {
    totalProjects: 0,
    totalScans: 0,
    totalDependencies: 0,
    averageRiskScore: null,
    highestRiskProject: null,
    lowestRiskProject: null,
    mostRecentScan: null,
    recentScans: [],
    riskDistribution: { ...EMPTY_RISK_DISTRIBUTION },
    projects: [],
  };
}

/**
 * Aggregates all dashboard statistics for a single authenticated user
 * in a fixed, small number of batched queries — one for the user's
 * projects, one for every scan across all of them, and two more
 * (dependency counts, risk reports) batched across all of those scans.
 * Every per-project or per-scan figure below is then derived in-memory
 * from that one result set, which is what keeps this free of N+1
 * queries regardless of how many projects or scans the user has.
 */
export const dashboardService = {
  async getDashboardStats(userId: string): Promise<DashboardStatsDTO> {
    const projects = await projectRepository.findByUser(userId);
    if (projects.length === 0) {
      return emptyDashboard();
    }

    const projectIds = projects.map((project) => project.id);
    const scans = await scanRepository.findManyByProjectIds(projectIds);
    const scanIds = scans.map((scan) => scan.id);

    const [dependencyCountByScanId, riskReports] = await Promise.all([
      dependencyRepository.countByScanIds(scanIds),
      riskReportRepository.findByScanIds(scanIds),
    ]);

    const latestRiskReportByScanId = keepFirstPerKey(riskReports, (report) => report.scanId);
    const latestScanByProjectId = keepFirstPerKey(scans, (scan) => scan.projectId);
    const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

    const projectSummaries = projects.map((project) =>
      buildProjectSummary(
        project,
        latestScanByProjectId.get(project.id),
        latestRiskReportByScanId,
        dependencyCountByScanId,
      ),
    );

    const scoredSummaries = projectSummaries.filter(isScored);

    // Average is over each project's latest score (one per project),
    // not over every historical RiskReport — see review notes for why.
    const averageRiskScore =
      scoredSummaries.length > 0
        ? roundTo(
            scoredSummaries.reduce((sum, summary) => sum + summary.latestRiskScore, 0) /
              scoredSummaries.length,
            AVERAGE_SCORE_DECIMAL_PLACES,
          )
        : null;

    const recentScans = buildRecentScans(scans, projectNameById, latestRiskReportByScanId);

    let totalDependencies = 0;
    for (const count of dependencyCountByScanId.values()) {
      totalDependencies += count;
    }

    return {
      totalProjects: projects.length,
      totalScans: scans.length,
      totalDependencies,
      averageRiskScore,
      highestRiskProject: pickExtremeProject(scoredSummaries, (candidate, best) => candidate > best),
      lowestRiskProject: pickExtremeProject(scoredSummaries, (candidate, best) => candidate < best),
      mostRecentScan: recentScans[0] ?? null,
      recentScans,
      riskDistribution: computeRiskDistribution(projectSummaries),
      projects: projectSummaries,
    };
  },
};