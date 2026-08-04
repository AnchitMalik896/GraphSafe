import type { AnalyzableDependency, RiskFinding, RiskRuleName } from '../types/risk';


export interface RiskRule {
  readonly name: RiskRuleName;
  evaluate(dependencies: AnalyzableDependency[]): RiskFinding[];
}