import type { Project } from '@prisma/client';

import { prisma } from '../database/prisma';

export interface CreateProjectData {
  name: string;
  repositoryUrl: string;
  userId: string;
}

export interface UpdateProjectData {
  name?: string;
  repositoryUrl?: string;
}

export const projectRepository = {
  create(data: CreateProjectData): Promise<Project> {
    return prisma.project.create({ data });
  },

  findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } });
  },

  findByUser(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByRepositoryUrl(userId: string, repositoryUrl: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { userId, repositoryUrl },
    });
  },

  update(id: string, data: UpdateProjectData): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  },

  delete(id: string): Promise<Project> {
    return prisma.project.delete({ where: { id } });
  },
};