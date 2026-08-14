import type { RiskLevel } from '@/types/scan';

export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ScanDto {
  id: string;
  projectId: string;
  status: ScanStatus;
  riskScore: number | null;
  scannedAt: string | null;
  createdAt: string;
  completedAt: string | null;
  manifestFiles: string[];
  ecosystems: string[];
}

export interface RiskReportDto {
  vulnerablePackages: number;
  outdatedPackages: number;
  deprecatedPackages: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  totalFindings: number;
  generatedAt: string;
}

export interface DependencyDto {
  id: string;
  packageName: string;
  version: string;
  latestVersion: string | null;
  vulnerable: boolean;
  deprecated: boolean;
  popularityScore: number | null;
}

export interface ScanDetails {
  scan: ScanDto;
  riskReport: RiskReportDto | null;
  dependencies: DependencyDto[];
}