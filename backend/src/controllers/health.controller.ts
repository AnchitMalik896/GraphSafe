import type { Request, Response } from 'express';

import { getHealthStatus } from '../services/health.service';
import type { ApiSuccessResponse, HealthCheckResponse } from '../types/api';
import { asyncHandler } from '../utils/asyncHandler';

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const health = getHealthStatus();
  const body: ApiSuccessResponse<HealthCheckResponse> = {
    success: true,
    data: health,
  };
  res.status(200).json(body);
});
