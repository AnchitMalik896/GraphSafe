import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useCreateProject } from '@/hooks/useCreateProject';
import { cn } from '@/lib/cn';
import { createProjectSchema, type CreateProjectFormValues } from '@/schemas/project.schema';
import { getApiErrorMessage } from '@/utils/apiError';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', repositoryUrl: '' },
  });

  async function onSubmit(values: CreateProjectFormValues) {
    try {
      const project = await mutateAsync(values);
      toast.success('Project created successfully');
      navigate(`/projects/${project.id}`, { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create project'));
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Project</h1>
        <p className="text-sm text-muted-foreground">
          Track a GitHub repository for dependency risk scanning.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Project Name
          </label>
          <input
            id="name"
            type="text"
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring',
              errors.name && 'border-destructive focus:ring-destructive',
            )}
            placeholder="Payments Service"
            {...register('name')}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="repositoryUrl" className="text-sm font-medium">
            Repository URL
          </label>
          <input
            id="repositoryUrl"
            type="text"
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring',
              errors.repositoryUrl && 'border-destructive focus:ring-destructive',
            )}
            placeholder="https://github.com/owner/repo"
            {...register('repositoryUrl')}
          />
          {errors.repositoryUrl && (
            <p className="text-xs text-destructive">{errors.repositoryUrl.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Project
        </button>
      </form>
    </div>
  );
}