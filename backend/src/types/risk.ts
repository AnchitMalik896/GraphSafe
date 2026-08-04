/**
 * Severity scale used by every risk rule's findings. `critical` is
 * included now even though no Phase 5A rule emits it yet, so rules
 * added later don't need a type change to use it.
 */
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Identifies which rule produced a given finding. Extend this union
 * whenever a new rule module is added under `src/rules/`.
 */
export type RiskRuleName = 'vulnerability' | 'outdated-package' | 'deprecated-package' | 'popularity';

/**
 * A single issue raised by a rule against one dependency.
 */
export interface RiskFinding {
  rule: RiskRuleName;
  severity: RiskSeverity;
  packageName: string;
  message: string;
}

/**
 * The plain shape that risk rules are allowed to see. Deliberately not
 * the Prisma `Dependency` type — rules must not know about Prisma, and
 * this keeps them decoupled from the ORM entirely, not just from the
 * client instance. `RiskAnalysisService` is responsible for mapping a
 * real `Dependency` record onto this shape before invoking any rule.
 */
export interface AnalyzableDependency {
  packageName: string;
  version: string;
  latestVersion: string | null;
  vulnerable: boolean;
  deprecated: boolean;
  popularityScore: number | null;
}

/**
 * Intermediate analysis output for a single scan. This is NOT the
 * `RiskReport` Prisma model — it deliberately omits an overall score,
 * which a later phase will compute from these findings and persist.
 */
export interface RiskAnalysisReport {
  totalDependencies: number;
  totalFindings: number;
  findings: RiskFinding[];
  generatedAt: Date;
}