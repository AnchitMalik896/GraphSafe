import { deprecatedPackageRule } from './deprecatedPackage.rule';
import { outdatedPackageRule } from './outdatedPackage.rule';
import { popularityRule } from './popularity.rule';
import type { RiskRule } from './riskRule';
import { vulnerabilityRule } from './vulnerability.rule';

export const riskRules: RiskRule[] = [
  vulnerabilityRule,
  outdatedPackageRule,
  deprecatedPackageRule,
  popularityRule,
];

export type { RiskRule } from './riskRule';