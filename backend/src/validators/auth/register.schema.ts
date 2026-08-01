import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ required_error: 'name is required' }).trim().min(1, 'name cannot be empty'),
  email: z.string({ required_error: 'email is required' }).trim().email('email must be valid'),
  password: z
    .string({ required_error: 'password is required' })
    .min(8, 'password must be at least 8 characters long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
