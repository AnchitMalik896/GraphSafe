import { CheckCircle2, XCircle } from 'lucide-react';

import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/cn';
import type { DependencyDto } from '@/types/scanDetails';

interface DependencyTableProps {
  dependencies: DependencyDto[];
}

function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        active
          ? 'bg-destructive/10 text-destructive'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      )}
    >
      {active ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function DependencyTable({ dependencies }: DependencyTableProps) {
  if (dependencies.length === 0) {
    return (
      <EmptyState
        title="No dependencies recorded"
        description="This scan did not persist any dependency data."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2 font-medium">Package</th>
            <th className="px-4 py-2 font-medium">Installed</th>
            <th className="px-4 py-2 font-medium">Latest</th>
            <th className="px-4 py-2 font-medium">Vulnerable</th>
            <th className="px-4 py-2 font-medium">Deprecated</th>
            <th className="px-4 py-2 font-medium">Popularity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {dependencies.map((dependency) => (
            <tr key={dependency.id} className="hover:bg-muted/40">
              <td className="px-4 py-2.5 font-medium">{dependency.packageName}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{dependency.version}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {dependency.latestVersion ?? '—'}
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge active={dependency.vulnerable} activeLabel="Vulnerable" inactiveLabel="Safe" />
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge
                  active={dependency.deprecated}
                  activeLabel="Deprecated"
                  inactiveLabel="Active"
                />
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {dependency.popularityScore ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}