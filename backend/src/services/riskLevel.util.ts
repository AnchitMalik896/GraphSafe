import { RISK_LEVEL_THRESHOLDS } from './riskScoring.constants';
import type { RiskLevel } from '../types/scoring';

export function determineRiskLevel(score: number): RiskLevel {
  const match = RISK_LEVEL_THRESHOLDS.find((threshold) => score >= threshold.minScore);

  return match?.level ?? 'LOW';
}