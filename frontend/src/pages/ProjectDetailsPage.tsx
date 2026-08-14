import { AlertTriangle, ExternalLink, Loader2, ScanLine } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { EmptyState } from '@/components/common/EmptyState';
import { ScanResultCard } from '@/components/dashboard/ScanResultCard';
import { useGithubScan } from '@/hooks/useGithubScan';
import { useProject } from '@/hooks/useProject';
import type { GithubScanResult } from '@/types/scan';
import { getApiErrorMessage } from '@/utils/apiError';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, isError, error } = useProject(projectId);
  const { mutate: runScan, isPending: isScanning } = useGithubScan(projectId ?? '');
  const [scanResult, setScanResult] = useState<GithubScanResult | null>(null);

  function handleScan() {
    if (!project || isScanning) return;

    runScan(
      { repositoryUrl: project.repositoryUrl },
      {
        onSuccess: (result) => {
          setScanResult(result);
          toast.success('Scan completed successfully');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Failed to scan repository'));
        },
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Project not found"
        description={error instanceof Error ? error.message : 'Unable to load this project.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <p className="text-sm text-muted-foreground">{project.repositoryUrl}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm font-medium">{new Date(project.createdAt).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Last Updated</p>
          <p className="text-sm font-medium">{new Date(project.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">GitHub Scan</h2>
            <p className="text-xs text-muted-foreground">
              Run a dependency risk scan against this repository.
            </p>
          </div>
          <button
            type="button"
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning Repository...
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" />
                Scan Repository
              </>
            )}
          </button>
        </div>

        {scanResult && (
          <div className="mt-4 space-y-3">
            <ScanResultCard result={scanResult} />
            <Link
              to={`/projects/${project.id}/scans/${scanResult.scanId}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-4"
            >
              View Scan Details
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}