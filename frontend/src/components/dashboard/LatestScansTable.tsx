import { cn } from '@/lib/cn';

type ScanStatus = 'Completed' | 'Running' | 'Failed';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface ScanRow {
  id: string;
  repository: string;
  risk: RiskLevel;
  status: ScanStatus;
  lastScan: string;
}

const MOCK_SCANS: ScanRow[] = [
  { id: '1', repository: 'acme/payments-service', risk: 'High', status: 'Completed', lastScan: '5 min ago' },
  { id: '2', repository: 'acme/web-app', risk: 'Medium', status: 'Completed', lastScan: '1 hour ago' },
  { id: '3', repository: 'acme/auth-service', risk: 'Critical', status: 'Completed', lastScan: '2 hours ago' },
  { id: '4', repository: 'acme/notification-worker', risk: 'Low', status: 'Completed', lastScan: '6 hours ago' },
  { id: '5', repository: 'acme/billing-api', risk: 'Medium', status: 'Running', lastScan: 'In progress' },
];

const RISK_STYLES: Record<RiskLevel, string> = {
  Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  High: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  Critical: 'bg-destructive/10 text-destructive',
};

const STATUS_STYLES: Record<ScanStatus, string> = {
  Completed: 'bg-secondary text-secondary-foreground',
  Running: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Failed: 'bg-destructive/10 text-destructive',
};

export function LatestScansTable() {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Latest Scans</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-medium">Repository</th>
              <th className="px-4 py-2 font-medium">Risk</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Last Scan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_SCANS.map((scan) => (
              <tr key={scan.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5 font-medium">{scan.repository}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      RISK_STYLES[scan.risk],
                    )}
                  >
                    {scan.risk}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLES[scan.status],
                    )}
                  >
                    {scan.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{scan.lastScan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}