import type { Prisma, Project } from '@prisma/client';

import { prisma } from '../database/prisma';

/**
 * Data access for the Project model. Project business logic (GitHub
 * integration, ownership rules, etc.) is out of scope for this phase
 * and will live in project.service.ts when it is introduced.
 */
export const projectRepository = {
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } });
  },

  async findManyByUserId(userId: string): Promise<Project[]> {
    return prisma.project.findMany({ where: { userId } });
  },

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  },
};
