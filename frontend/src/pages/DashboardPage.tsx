import { AlertOctagon, AlertTriangle, FolderGit2, Gauge, Loader2, ScanLine } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { cn } from '@/lib/cn';
import type { RiskLevel } from '@/types/scan';

const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  CRITICAL: 'bg-destructive/10 text-destructive',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, error } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your projects today.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load dashboard"
          description={error instanceof Error ? error.message : 'Please try again.'}
        />
      )}

      {!isLoading && !isError && stats && stats.totalProjects === 0 && (
        <EmptyState
          icon={FolderGit2}
          title="No projects yet"
          description="Create a project and run a scan to see stats here."
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

      {!isLoading && !isError && stats && stats.totalProjects > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderGit2} />
            <StatCard label="Total Scans" value={stats.totalScans} icon={ScanLine} />
            <StatCard
              label="Average Risk Score"
              value={stats.averageRiskScore ?? '—'}
              icon={Gauge}
              tone="warning"
            />
            <StatCard
              label="Highest Risk Project"
              value={stats.highestRiskProject?.projectName ?? '—'}
              icon={AlertOctagon}
              tone="danger"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Recent Scans</h2>
              </div>
              {stats.recentScans.length === 0 ? (
                <EmptyState title="No scans yet" description="Run a scan on a project to see activity here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Project</th>
                        <th className="px-4 py-2 font-medium">Risk</th>
                        <th className="px-4 py-2 font-medium">Score</th>
                        <th className="px-4 py-2 font-medium">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.recentScans.map((scan) => (
                        <tr key={scan.scanId} className="hover:bg-muted/40">
                          <td className="px-4 py-2.5 font-medium">
                            <Link to={`/projects/${scan.projectId}`} className="hover:underline">
                              {scan.projectName}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                                RISK_LEVEL_STYLES[scan.riskLevel],
                              )}
                            >
                              {scan.riskLevel}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">{scan.overallRiskScore}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">
                            {new Date(scan.completedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold">Risk Distribution</h2>
              <ul className="space-y-2">
                {(Object.keys(stats.riskDistribution) as RiskLevel[]).map((level) => (
                  <li key={level} className="flex items-center justify-between text-sm">
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                        RISK_LEVEL_STYLES[level],
                      )}
                    >
                      {level}
                    </span>
                    <span className="font-medium">{stats.riskDistribution[level]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}