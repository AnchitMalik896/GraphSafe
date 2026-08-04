export type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

export interface ParsedDependency {
  name: string;
  version: string;
  dependencyType: DependencyType;
}

/**
 * Minimal shape of a package.json this parser cares about. Any other
 * fields a real package.json contains (scripts, main, license, etc.)
 * are ignored entirely.
 */
export interface PackageManifestInput {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
}