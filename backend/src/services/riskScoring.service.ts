import {
  MAX_RISK_SCORE,
  MIN_RISK_SCORE,
  RISK_LEVEL_THRESHOLDS,
  SEVERITY_WEIGHTS,
} from './riskScoring.constants';
import type { RiskAnalysisReport, RiskFinding, RiskSeverity } from '../types/risk';
import type { FindingsBySeverity, RiskLevel, RiskScoringResult } from '../types/scoring';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function countFindingsBySeverity(findings: RiskFinding[]): FindingsBySeverity {
  const counts: FindingsBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const finding of findings) {
    counts[finding.severity] += 1;
  }
  return counts;
}

function calculateWeightedScore(findings: RiskFinding[]): number {
  return findings.reduce((total, finding) => total + SEVERITY_WEIGHTS[finding.severity as RiskSeverity], 0);
}

function normalizeScore(weightedScore: number): number {
  return clamp(weightedScore, MIN_RISK_SCORE, MAX_RISK_SCORE);
}

function determineRiskLevel(score: number): RiskLevel {
  const match = RISK_LEVEL_THRESHOLDS.find((threshold) => score >= threshold.minScore);
  // RISK_LEVEL_THRESHOLDS always includes a `minScore: 0` entry, so
  // `match` is guaranteed for any non-negative score; the fallback
  // only guards against a future edit to the threshold table.
  return match?.level ?? 'LOW';
}

/**
 * Converts a `RiskAnalysisReport` (raw findings) into a normalized,
 * classified risk score. Pure and synchronous: no Prisma, no I/O, no
 * knowledge of how or whether the result gets persisted. This is what
 * makes it trivially unit-testable and independent from
 * `RiskAnalysisService`.
 */
export const riskScoringService = {
  computeRiskScore(report: RiskAnalysisReport): RiskScoringResult {
    const findingsBySeverity = countFindingsBySeverity(report.findings);
    const weightedScore = calculateWeightedScore(report.findings);
    const overallRiskScore = normalizeScore(weightedScore);
    const riskLevel = determineRiskLevel(overallRiskScore);

    return {
      totalFindings: report.findings.length,
      findingsBySeverity,
      weightedScore,
      overallRiskScore,
      riskLevel,
    };
  },
};