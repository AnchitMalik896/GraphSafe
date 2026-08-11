import { AlertTriangle, CheckCircle2, GitBranch, PackagePlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  timestamp: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    icon: GitBranch,
    title: 'Repository scanned',
    description: 'acme/payments-service',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    icon: PackagePlus,
    title: 'New dependency detected',
    description: 'lodash@4.17.21 added to acme/web-app',
    timestamp: '32 minutes ago',
  },
  {
    id: '3',
    icon: AlertTriangle,
    title: 'Risk score changed',
    description: 'acme/auth-service risk increased to High',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    icon: CheckCircle2,
    title: 'Scan completed',
    description: 'acme/notification-worker — no new findings',
    timestamp: '6 hours ago',
  },
];

export function RecentActivityCard() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Recent Activity</h2>
      </div>

      <ul className="divide-y divide-border">
        {MOCK_ACTIVITY.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex items-start gap-3 px-4 py-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="truncate text-sm text-muted-foreground">{item.description}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.timestamp}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}