import type { AnalyzableDependency, RiskFinding } from '../types/risk';
import type { RiskRule } from './riskRule';

/**
 * Placeholder outdated-package rule for Phase 5A.
 *
 * Real "latest version" data would come from an npm registry lookup,
 * which is out of scope here. This rule only compares against
 * `Dependency.latestVersion`, a column nothing currently populates —
 * so today it deterministically produces no findings. Once a future
 * phase starts writing `latestVersion` during scans, this rule starts
 * flagging mismatches with no change to its own logic.
 */
export const outdatedPackageRule: RiskRule = {
  name: 'outdated-package',

  evaluate(dependencies: AnalyzableDependency[]): RiskFinding[] {
    return dependencies
      .filter(
        (dependency) =>
          dependency.latestVersion !== null && dependency.latestVersion !== dependency.version,
      )
      .map((dependency) => ({
        rule: 'outdated-package',
        severity: 'medium',
        packageName: dependency.packageName,
        message: `${dependency.packageName}@${dependency.version} has a newer version available (${dependency.latestVersion ?? 'unknown'}).`,
      }));
  },
};