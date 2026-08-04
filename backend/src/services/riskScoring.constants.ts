import type { RiskSeverity } from '../types/risk';
import type { RiskLevel } from '../types/scoring';

export const SEVERITY_WEIGHTS: Record<RiskSeverity, number> = {
  critical: 40,
  high: 20,
  medium: 10,
  low: 5,
};

export const MIN_RISK_SCORE = 0;
export const MAX_RISK_SCORE = 100;


export const RISK_LEVEL_THRESHOLDS: ReadonlyArray<{ level: RiskLevel; minScore: number }> = [
  { level: 'CRITICAL', minScore: 75 },
  { level: 'HIGH', minScore: 50 },
  { level: 'MEDIUM', minScore: 25 },
  { level: 'LOW', minScore: 0 },
];