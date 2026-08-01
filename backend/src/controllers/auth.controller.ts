import type { Request, Response } from 'express';

import { authService } from '../services/auth.service';
import type { ApiSuccessResponse } from '../types/api';
import type { SafeUser } from '../types/auth';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  const body: ApiSuccessResponse<typeof result> = {
    success: true,
    data: result,
  };
  res.status(201).json(body);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  const body: ApiSuccessResponse<typeof result> = {
    success: true,
    data: result,
  };
  res.status(200).json(body);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // `authenticate` middleware guarantees `req.user` is set before this
  // handler runs; the check below only satisfies the type system.
  if (!req.user) {
    throw AppError.unauthorized();
  }

  const body: ApiSuccessResponse<{ user: SafeUser }> = {
    success: true,
    data: { user: req.user },
  };
  res.status(200).json(body);
});
