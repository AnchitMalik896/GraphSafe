export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  repositoryUrl: string;
}

export interface UpdateProjectPayload {
  name?: string;
  repositoryUrl?: string;
}