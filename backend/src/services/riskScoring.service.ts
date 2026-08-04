import { determineRiskLevel } from './riskLevel.util';
import { MAX_RISK_SCORE, MIN_RISK_SCORE, SEVERITY_WEIGHTS } from './riskScoring.constants';
import type { RiskAnalysisReport, RiskFinding } from '../types/risk';
import type { FindingsBySeverity, RiskScoringResult } from '../types/scoring';

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
  return findings.reduce((total, finding) => total + SEVERITY_WEIGHTS[finding.severity], 0);
}

function normalizeScore(weightedScore: number): number {
  return clamp(weightedScore, MIN_RISK_SCORE, MAX_RISK_SCORE);
}


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