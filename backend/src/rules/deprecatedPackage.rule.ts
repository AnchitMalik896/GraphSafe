import type { AnalyzableDependency, RiskFinding } from '../types/risk';
import type { RiskRule } from './riskRule';

export const deprecatedPackageRule: RiskRule = {
  name: 'deprecated-package',

  evaluate(dependencies: AnalyzableDependency[]): RiskFinding[] {
    return dependencies
      .filter((dependency) => dependency.deprecated)
      .map((dependency) => ({
        rule: 'deprecated-package',
        severity: 'medium',
        packageName: dependency.packageName,
        message: `${dependency.packageName}@${dependency.version} is deprecated.`,
      }));
  },
};