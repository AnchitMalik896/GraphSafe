import type { AnalyzableDependency, RiskFinding } from '../types/risk';
import type { RiskRule } from './riskRule';

/** Placeholder threshold below which a package is considered low-popularity. */
const LOW_POPULARITY_THRESHOLD = 0.2;

/**
 * Placeholder popularity rule for Phase 5A.
 *
 * Real popularity data (npm download counts, GitHub stars, etc.) is
 * out of scope here. This rule only looks at
 * `Dependency.popularityScore`, a column nothing currently populates —
 * so today it deterministically produces no findings. Once a future
 * phase starts writing `popularityScore` during scans, this rule
 * starts flagging low-popularity packages with no change to its own
 * logic.
 */
export const popularityRule: RiskRule = {
  name: 'popularity',

  evaluate(dependencies: AnalyzableDependency[]): RiskFinding[] {
    return dependencies
      .filter(
        (dependency) =>
          dependency.popularityScore !== null &&
          dependency.popularityScore < LOW_POPULARITY_THRESHOLD,
      )
      .map((dependency) => ({
        rule: 'popularity',
        severity: 'low',
        packageName: dependency.packageName,
        message: `${dependency.packageName}@${dependency.version} has low popularity (score: ${dependency.popularityScore}).`,
      }));
  },
};