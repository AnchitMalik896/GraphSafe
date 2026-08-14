import type { RiskLevel, ScanStatus } from '@prisma/client';

export interface ScanDto {
  id: string;
  projectId: string;
  status: ScanStatus;
  riskScore: number | null;
  scannedAt: Date | null;
  createdAt: Date;
  completedAt: Date | null;
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
  generatedAt: Date;
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

export interface ScanDetailsDto {
  scan: ScanDto;
  riskReport: RiskReportDto | null;
  dependencies: DependencyDto[];
}