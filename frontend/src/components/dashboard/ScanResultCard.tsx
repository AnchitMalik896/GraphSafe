import { Activity, Layers, ListChecks, ShieldAlert } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { GithubScanResult, RiskLevel } from '@/types/scan';

const RISK_LEVEL_STYLES: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  MEDIUM: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  HIGH: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  CRITICAL: 'bg-destructive/10 text-destructive',
};

interface ScanResultCardProps {
  result: GithubScanResult;
}

export function ScanResultCard({ result }: ScanResultCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Scan Result</h3>
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
            RISK_LEVEL_STYLES[result.riskLevel],
          )}
        >
          {result.riskLevel}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <p className="text-sm font-semibold">{result.overallRiskScore}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Dependencies</p>
            <p className="text-sm font-semibold">{result.dependencyCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Total Findings</p>
            <p className="text-sm font-semibold">{result.totalFindings}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Generated At</p>
            <p className="text-sm font-semibold">
              {new Date(result.generatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Scan ID: {result.scanId}
      </p>
    </div>
  );
}