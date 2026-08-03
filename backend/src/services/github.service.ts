import { rm } from 'fs/promises';
import simpleGit from 'simple-git';

import { AppError } from '../utils/AppError';

const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

export interface ParsedRepository {
  owner: string;
  repo: string;
}

export function validateRepositoryUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw AppError.badRequest('Repository URL must be a valid URL');
  }

  if (parsed.protocol !== 'https:') {
    throw AppError.badRequest('Repository URL must use https');
  }

  if (!GITHUB_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw AppError.badRequest('Only github.com repository URLs are supported');
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  if (segments.length < 2) {
    throw AppError.badRequest(
      'Repository URL must include an owner and repository name (e.g. github.com/owner/repo)',
    );
  }
}

export function normalizeRepositoryUrl(url: string): string {
  const { owner, repo } = parseRepository(url);
  return `https://github.com/${owner}/${repo}`;
}

export function parseRepository(url: string): ParsedRepository {
  validateRepositoryUrl(url);

  const parsed = new URL(url);
  const segments = parsed.pathname.split('/').filter(Boolean);
  const [owner, rawRepo] = segments;

  if (!owner || !rawRepo) {
    throw AppError.badRequest(
      'Repository URL must include an owner and repository name (e.g. github.com/owner/repo)',
    );
  }

  const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo;

  if (!repo) {
    throw AppError.badRequest('Repository URL must include a repository name');
  }

  return { owner, repo };
}

export async function cloneRepository(url: string, destination: string): Promise<void> {
  const normalizedUrl = normalizeRepositoryUrl(url);

  try {
    await simpleGit().clone(normalizedUrl, destination, ['--depth', '1']);
  } catch {
    throw AppError.badRequest(
      'Unable to clone repository. It may not exist, may be private, or may be unavailable.',
    );
  }
}

export async function removeRepository(path: string): Promise<void> {
  if (!path || path.trim().length === 0) {
    throw AppError.internal('Cannot remove repository: no path provided');
  }

  await rm(path, { recursive: true, force: true });
}