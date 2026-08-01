import type { User } from '@prisma/client';

import type { SafeUser } from '../types/auth';

/**
 * Strips `passwordHash` off a User. This is the single shared place
 * that boundary is enforced — anywhere a User is about to be attached
 * to `req.user` or returned from the API, it must go through here.
 * Built as an explicit allow-list (rather than destructuring the field
 * away) so a future field added to `User` doesn't leak through by
 * accident.
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
