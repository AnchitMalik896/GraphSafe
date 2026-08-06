import type { Request, Response } from 'express';

import * as projectService from '../services/project.service';
import type { ApiSuccessResponse } from '../types/api';
import { asyncHandler } from '../utils/asyncHandler';
import { requireUser } from '../utils/requireUser';

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const project = await projectService.createProject(user.id, req.body);
  const body: ApiSuccessResponse<typeof project> = { success: true, data: project };
  res.status(201).json(body);
});

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const projects = await projectService.listProjects(user.id);
  const body: ApiSuccessResponse<typeof projects> = { success: true, data: projects };
  res.status(200).json(body);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const project = await projectService.getProject(user.id, req.params.id as string);
  const body: ApiSuccessResponse<typeof project> = { success: true, data: project };
  res.status(200).json(body);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const project = await projectService.updateProject(user.id, req.params.id as string, req.body);
  const body: ApiSuccessResponse<typeof project> = { success: true, data: project };
  res.status(200).json(body);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const user = requireUser(req);
  const project = await projectService.deleteProject(user.id, req.params.id as string);
  const body: ApiSuccessResponse<typeof project> = { success: true, data: project };
  res.status(200).json(body);
});