import type { Prisma, Scan } from '@prisma/client';

import { prisma } from '../database/prisma';

export const scanRepository = {
  async findById(id: string): Promise<Scan | null> {
    return prisma.scan.findUnique({
      where: { id },
    });
  },

  async findManyByProjectId(projectId: string): Promise<Scan[]> {
    return prisma.scan.findMany({
      where: { projectId },
    });
  },

  async findManyByProjectIds(projectIds: string[]): Promise<Scan[]> {
    if (projectIds.length === 0) {
      return [];
    }

    return prisma.scan.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async create(data: Prisma.ScanCreateInput): Promise<Scan> {
    return prisma.scan.create({
      data,
    });
  },

  async update(id: string, data: Prisma.ScanUpdateInput): Promise<Scan> {
    return prisma.scan.update({
      where: { id },
      data,
    });
  },
};