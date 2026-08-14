import type { Request, Response } from 'express';

import { scanService } from '../services/scan.service';
import type { ApiSuccessResponse } from '../types/api';
import type { ScanDetailsDto } from '../types/scanDetails';
import { asyncHandler } from '../utils/asyncHandler';
import { requireUser } from '../utils/requireUser';

export const getScanDetails = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const projectId = req.params.projectId as string;
  const scanId = req.params.scanId as string;

  const result = await scanService.getScanDetails(user.id, projectId, scanId);

  const body: ApiSuccessResponse<ScanDetailsDto> = { success: true, data: result };
  res.status(200).json(body);
});