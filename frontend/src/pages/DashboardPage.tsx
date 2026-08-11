import { AlertOctagon, FolderGit2, Gauge, ScanLine } from 'lucide-react';

import { LatestScansTable } from '@/components/dashboard/LatestScansTable';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { useAuth } from '@/hooks/useAuth';

const MOCK_STATS = {
  totalProjects: 12,
  totalScans: 86,
  averageRisk: 42,
  highRiskProjects: 3,
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your projects today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={MOCK_STATS.totalProjects} icon={FolderGit2} />
        <StatCard label="Total Scans" value={MOCK_STATS.totalScans} icon={ScanLine} />
        <StatCard
          label="Average Risk Score"
          value={MOCK_STATS.averageRisk}
          icon={Gauge}
          tone="warning"
        />
        <StatCard
          label="High Risk Projects"
          value={MOCK_STATS.highRiskProjects}
          icon={AlertOctagon}
          tone="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LatestScansTable />
        </div>
        <RecentActivityCard />
      </div>
    </div>
  );
}