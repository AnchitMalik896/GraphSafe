import type { RiskSeverity } from './risk';


export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type FindingsBySeverity = Record<RiskSeverity, number>;
export interface RiskScoringResult {
  totalFindings: number;
  findingsBySeverity: FindingsBySeverity;
  weightedScore: number;
  overallRiskScore: number;
  riskLevel: RiskLevel;
}