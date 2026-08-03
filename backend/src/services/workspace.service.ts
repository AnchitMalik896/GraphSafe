import { randomUUID } from 'crypto';
import { mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import { AppError } from '../utils/AppError';

const WORKSPACE_PREFIX = 'graphsafe-';

export async function createWorkspace(): Promise<string> {
  const workspacePath = path.join(tmpdir(), `${WORKSPACE_PREFIX}${randomUUID()}`);
  await mkdir(workspacePath, { recursive: true });
  return workspacePath;
}

export async function removeWorkspace(workspacePath: string): Promise<void> {
  const resolvedPath = path.resolve(workspacePath);
  const resolvedTmpDir = path.resolve(tmpdir());
  const relative = path.relative(resolvedTmpDir, resolvedPath);
  const withinTmpDir = relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
  const isWorkspaceDir = path.basename(resolvedPath).startsWith(WORKSPACE_PREFIX);

  if (!withinTmpDir || !isWorkspaceDir) {
    throw AppError.internal('Refusing to remove a path outside a GraphSafe workspace');
  }

  await rm(resolvedPath, { recursive: true, force: true });
}