import type { RiskLevel } from '@prisma/client';

export interface GithubScanRequestBody {
  repositoryUrl: string;
}

export interface GithubScanResultDto {
  scanId: string;
  dependencyCount: number;
  totalFindings: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  generatedAt: string;
}