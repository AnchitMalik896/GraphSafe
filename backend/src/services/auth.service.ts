import bcrypt from 'bcrypt';

import { userRepository } from '../repositories/user.repository';
import type { SafeUser } from '../types/auth';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import { toSafeUser } from '../utils/toSafeUser';

const SALT_ROUNDS = 12;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: SafeUser }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.badRequest('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    return { user: toSafeUser(user) };
  },

  async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = signToken({ sub: user.id });

    return { user: toSafeUser(user), token };
  },
};
