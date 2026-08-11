import { api } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateProjectPayload, Project, UpdateProjectPayload } from '@/types/project';

export const projectService = {
  async listProjects(): Promise<Project[]> {
    const { data } = await api.get<ApiSuccessResponse<Project[]>>('/projects');
    return data.data;
  },

  async getProject(id: string): Promise<Project> {
    const { data } = await api.get<ApiSuccessResponse<Project>>(`/projects/${id}`);
    return data.data;
  },

  async createProject(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await api.post<ApiSuccessResponse<Project>>('/projects', payload);
    return data.data;
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await api.patch<ApiSuccessResponse<Project>>(`/projects/${id}`, payload);
    return data.data;
  },

  async deleteProject(id: string): Promise<Project> {
    const { data } = await api.delete<ApiSuccessResponse<Project>>(`/projects/${id}`);
    return data.data;
  },
};