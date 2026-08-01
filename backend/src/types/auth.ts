import type { User } from '@prisma/client';

/**
 * A User with `passwordHash` stripped out. This is the shape that is
 * safe to send in any API response — `passwordHash` must never leave
 * the service/repository layer.
 */
export type SafeUser = Omit<User, 'passwordHash'>;

/**
 * Shape of the payload encoded inside issued JWTs.
 */
export interface JwtPayload {
  sub: string;
}
