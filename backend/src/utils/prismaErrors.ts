import { Prisma } from '@prisma/client';

const UNIQUE_CONSTRAINT_VIOLATION_CODE = 'P2002';

export function isPrismaUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION_CODE
  );
}