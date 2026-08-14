import { AlertTriangle, Layers, ListChecks, PackageX, ShieldAlert, ShieldOff } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/dashboard/StatCard';
import { DependencyTable } from '@/components/scans/DependencyTable';
import { useScanDetails } from '@/hooks/useScanDetails';
import { cn } from '@/lib/cn';
import type { RiskLevel } from '@/types/scan';
import type { ScanStatus } from '@/types/scanDetails';

const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  CRITICAL: 'bg-destructive/10 text-destructive',
};

const STATUS_STYLES: Record<ScanStatus, string> = {
  PENDING: 'bg-secondary text-secondary-foreground',
  RUNNING: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  FAILED: 'bg-destructive/10 text-destructive',
};

export default function ScanDetailsPage() {
  const { projectId, scanId } = useParams<{ projectId: string; scanId: string }>();
  const { data, isLoading, isError, error } = useScanDetails(projectId, scanId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Scan not found"
        description={error instanceof Error ? error.message : 'Unable to load this scan.'}
      />
    );
  }

  const { scan, riskReport, dependencies } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Scan Details</h1>
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                STATUS_STYLES[scan.status],
              )}
            >
              {scan.status}
            </span>
            {riskReport && (
              <span
                className={cn(
                  'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                  RISK_LEVEL_STYLES[riskReport.riskLevel],
                )}
              >
                {riskReport.riskLevel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Scan ID: {scan.id}</p>
        </div>
        <Link to={`/projects/${scan.projectId}`} className="text-sm font-medium underline underline-offset-4">
          Back to project
        </Link>
      </div>

      {riskReport ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Risk Score" value={riskReport.overallRiskScore} icon={ShieldAlert} tone="warning" />
          <StatCard label="Total Findings" value={riskReport.totalFindings} icon={ListChecks} />
          <StatCard
            label="Vulnerable Packages"
            value={riskReport.vulnerablePackages}
            icon={ShieldOff}
            tone="danger"
          />
          <StatCard label="Deprecated Packages" value={riskReport.deprecatedPackages} icon={PackageX} />
        </div>
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title="No risk report yet"
          description="This scan has not produced a risk report."
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Outdated Packages</p>
          <p className="text-sm font-medium">{riskReport?.outdatedPackages ?? '—'}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Dependency Count</p>
          <p className="text-sm font-medium">{dependencies.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-sm font-medium">{new Date(scan.createdAt).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-sm font-medium">
            {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : '—'}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-muted-foreground" />
          Manifest Files &amp; Ecosystems
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {scan.manifestFiles.length === 0 && scan.ecosystems.length === 0 ? (
            <p className="text-sm text-muted-foreground">None recorded.</p>
          ) : (
            <>
              {scan.manifestFiles.map((file) => (
                <span key={file} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {file}
                </span>
              ))}
              {scan.ecosystems.map((eco) => (
                <span key={eco} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                  {eco}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Dependencies</h2>
        <DependencyTable dependencies={dependencies} />
      </div>
    </div>
  );
}