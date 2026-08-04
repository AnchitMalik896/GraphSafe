import type { Request, Response } from 'express';

import { dashboardService } from '../services/dashboard.service';
import type { ApiSuccessResponse } from '../types/api';
import type { DashboardStatsDTO } from '../types/dashboard';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

function requireUser(req: Request): { id: string } {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const stats = await dashboardService.getDashboardStats(user.id);
  const body: ApiSuccessResponse<DashboardStatsDTO> = { success: true, data: stats };
  res.status(200).json(body);
});