import { EmptyManifestError, InvalidPackageJsonError } from './parser.errors';
import type { DependencyType, PackageManifestInput, ParsedDependency } from './parser.types';

/**
 * Sections read from package.json, ordered from LOWEST to HIGHEST
 * duplicate-resolution priority. When the same package name appears in
 * more than one section, the entry from the section that appears later
 * in this list wins — implementing the required precedence:
 *
 *   dependencies > peerDependencies > optionalDependencies > devDependencies
 */
const SECTIONS_LOW_TO_HIGH_PRIORITY: DependencyType[] = [
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
  'dependencies',
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type-guards + normalizes a single dependency section (e.g. the value
 * of `dependencies`) into a `Record<string, string>`. Any section that
 * isn't a plain object of string values is treated as absent rather
 * than throwing — the parser only cares about the four known sections
 * and silently ignores anything malformed elsewhere in the manifest.
 */
function readSection(manifest: PackageManifestInput, section: DependencyType): Record<string, string> {
  const value = manifest[section];
  if (!isPlainObject(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [name, version] of Object.entries(value)) {
    if (typeof version === 'string') {
      result[name] = version;
    }
  }
  return result;
}

function parseJsonString(raw: string): PackageManifestInput {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new EmptyManifestError();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new InvalidPackageJsonError();
  }

  if (!isPlainObject(parsed)) {
    throw new InvalidPackageJsonError('package.json must contain a JSON object');
  }

  return parsed as PackageManifestInput;
}

function normalizeManifest(input: string | PackageManifestInput | null | undefined): PackageManifestInput {
  if (input === null || input === undefined) {
    throw new EmptyManifestError();
  }

  if (typeof input === 'string') {
    return parseJsonString(input);
  }

  if (!isPlainObject(input)) {
    throw new InvalidPackageJsonError('package.json must contain a JSON object');
  }

  return input;
}

/**
 * Parses a package.json manifest — given as either a raw JSON string or
 * an already-parsed object — into a flat, de-duplicated list of
 * normalized dependencies.
 *
 * Behavior:
 * - Invalid JSON string input -> throws InvalidPackageJsonError.
 * - Empty/whitespace-only string, or null/undefined object -> throws
 *   EmptyManifestError.
 * - A validly-parsed object with none of the four dependency sections
 *   (including `{}`) -> returns an empty array, does NOT throw.
 * - A package appearing in multiple sections is included once, using
 *   the precedence: dependencies > peerDependencies > optionalDependencies
 *   > devDependencies.
 *
 * Pure function: no I/O, no logging, no side effects, deterministic.
 */
function parse(input: string | PackageManifestInput): ParsedDependency[] {
  const manifest = normalizeManifest(input);

  const byName = new Map<string, ParsedDependency>();

  for (const section of SECTIONS_LOW_TO_HIGH_PRIORITY) {
    const entries = readSection(manifest, section);
    for (const [name, version] of Object.entries(entries)) {
      byName.set(name, { name, version, dependencyType: section });
    }
  }

  return Array.from(byName.values());
}

export const packageParser = {
  parse,
};