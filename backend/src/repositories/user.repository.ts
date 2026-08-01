import type { Prisma, User } from '@prisma/client';

import { prisma } from '../database/prisma';

/**
 * Data access for the User model. No business logic — validation,
 * password hashing, and JWT issuance belong in auth.service.ts.
 */
export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },
};
