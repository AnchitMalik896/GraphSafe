export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GithubScanRequestBody {
  repositoryUrl: string;
}

export interface GithubScanResult {
  scanId: string;
  dependencyCount: number;
  totalFindings: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  generatedAt: string;
}