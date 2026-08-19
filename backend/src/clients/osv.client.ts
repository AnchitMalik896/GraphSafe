import type { RawVulnerabilityRecord, VulnerabilityLookupTarget } from '../types/vulnerability';

/**
 * Contract for any client capable of resolving vulnerability records for a
 * batch of dependencies. Defined as an interface so `vulnerability.service.ts`
 * depends on this shape rather than a concrete HTTP implementation — the real
 * OSV.dev integration (a future phase) can replace `osvClient` below without
 * changing any call site.
 */
export interface OsvClient {
  /**
   * Resolves raw vulnerability records for a batch of dependencies in one
   * round trip. Returns a map keyed by `dependencyId` so callers can look
   * up results per-target without re-scanning an array.
   */
  queryBatch(
    targets: VulnerabilityLookupTarget[],
  ): Promise<Map<string, RawVulnerabilityRecord[]>>;
}

/**
 * Placeholder OSV client for Phase 2 scaffolding.
 *
 * No network calls are made yet — OSV.dev integration is implemented in a
 * future phase. This exists purely to give `vulnerability.service.ts` a
 * stable dependency to call against now, so wiring in the real HTTP client
 * later is a single-file change with no ripple effects.
 */
export const osvClient: OsvClient = {
  queryBatch(targets: VulnerabilityLookupTarget[]): Promise<Map<string, RawVulnerabilityRecord[]>> {
    void targets;
    return Promise.resolve(new Map<string, RawVulnerabilityRecord[]>());
  },
};