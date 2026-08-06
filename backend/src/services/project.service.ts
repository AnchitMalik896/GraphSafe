import type { Project } from '@prisma/client';

import { projectRepository } from '../repositories/project.repository';
import { AppError } from '../utils/AppError';
import { isPrismaUniqueConstraintViolation } from '../utils/prismaErrors';
import type { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';

async function getOwnedProjectOrThrow(userId: string, projectId: string): Promise<Project> {
  const project = await projectRepository.findById(projectId);

  if (!project || project.userId !== userId) {
    throw AppError.notFound('Project not found');
  }

  return project;
}

const DUPLICATE_REPOSITORY_URL_MESSAGE = 'You have already added a project with this repository URL';

export async function createProject(userId: string, input: CreateProjectInput): Promise<Project> {
  const existing = await projectRepository.findByRepositoryUrl(userId, input.repositoryUrl);
  if (existing) {
    throw AppError.conflict(DUPLICATE_REPOSITORY_URL_MESSAGE);
  }

  try {
    return await projectRepository.create({
      name: input.name,
      repositoryUrl: input.repositoryUrl,
      userId,
    });
  } catch (error) {
    // Defends against a race between the check above and the insert below
    // (two concurrent requests for the same user + repository URL).
    if (isPrismaUniqueConstraintViolation(error)) {
      throw AppError.conflict(DUPLICATE_REPOSITORY_URL_MESSAGE);
    }
    throw error;
  }
}

export async function listProjects(userId: string): Promise<Project[]> {
  return projectRepository.findByUser(userId);
}

export async function getProject(userId: string, projectId: string): Promise<Project> {
  return getOwnedProjectOrThrow(userId, projectId);
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const project = await getOwnedProjectOrThrow(userId, projectId);

  if (input.repositoryUrl && input.repositoryUrl !== project.repositoryUrl) {
    const existing = await projectRepository.findByRepositoryUrl(userId, input.repositoryUrl);
    if (existing) {
      throw AppError.conflict(DUPLICATE_REPOSITORY_URL_MESSAGE);
    }
  }

  try {
    return await projectRepository.update(project.id, {
      name: input.name,
      repositoryUrl: input.repositoryUrl,
    });
  } catch (error) {
    if (isPrismaUniqueConstraintViolation(error)) {
      throw AppError.conflict(DUPLICATE_REPOSITORY_URL_MESSAGE);
    }
    throw error;
  }
}

export async function deleteProject(userId: string, projectId: string): Promise<Project> {
  const project = await getOwnedProjectOrThrow(userId, projectId);
  return projectRepository.delete(project.id);
}