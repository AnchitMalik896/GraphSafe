import type { RiskLevel } from './scoring';

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