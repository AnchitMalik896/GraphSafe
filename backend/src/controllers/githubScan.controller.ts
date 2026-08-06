import type { Request, Response } from 'express';

import { githubScanService } from '../services/githubScan.service';
import type { ApiSuccessResponse } from '../types/api';
import type { GithubScanRequestBody } from '../types/githubScan';
import { asyncHandler } from '../utils/asyncHandler';
import { requireUser } from '../utils/requireUser';

export const runGithubScan = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const projectId = req.params.projectId as string;
  const { repositoryUrl } = req.body as GithubScanRequestBody;

  const result = await githubScanService.runScan(user.id, projectId, repositoryUrl);

  const body: ApiSuccessResponse<typeof result> = { success: true, data: result };
  res.status(201).json(body);
});