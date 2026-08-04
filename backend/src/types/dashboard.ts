import type { RiskLevel } from './scoring';

export interface ProjectSummaryDTO {
  projectId: string;
  projectName: string;
  latestScanId: string | null;
  latestRiskScore: number | null;
  latestRiskLevel: RiskLevel | null;
  dependencyCount: number;
  lastScannedAt: Date | null;
}

export interface RecentScanActivityDTO {
  scanId: string;
  projectId: string;
  projectName: string;
  completedAt: Date;
  overallRiskScore: number;
  riskLevel: RiskLevel;
}

export type RiskDistribution = Record<RiskLevel, number>;

export interface DashboardStatsDTO {
  totalProjects: number;
  totalScans: number;
  totalDependencies: number;
  averageRiskScore: number | null;
  highestRiskProject: ProjectSummaryDTO | null;
  lowestRiskProject: ProjectSummaryDTO | null;
  mostRecentScan: RecentScanActivityDTO | null;
  recentScans: RecentScanActivityDTO[];
  riskDistribution: RiskDistribution;
  projects: ProjectSummaryDTO[];
}