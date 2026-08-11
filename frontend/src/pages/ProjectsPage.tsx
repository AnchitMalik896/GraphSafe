import { AlertTriangle, FolderGit2, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { useProjects } from '@/hooks/useProjects';

export default function ProjectsPage() {
  const { data: projects, isLoading, isError, error } = useProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Repositories tracked for dependency risk scanning.
          </p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load projects"
          description={error instanceof Error ? error.message : 'Please try again.'}
        />
      )}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create your first project to start scanning a repository."
          action={
            <Link
              to="/projects/new"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Create Project
            </Link>
          }
        />
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                  <FolderGit2 className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{project.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{project.repositoryUrl}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Added {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}