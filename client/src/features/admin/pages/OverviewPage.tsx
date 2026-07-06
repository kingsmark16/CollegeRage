import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { BarChart3, Cloud, Database, HardDrive, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import AnalyticsPageViewsChart from '@/features/analytics/components/AnalyticsPageViewsChart';
import AnalyticsVisitorList from '@/features/analytics/components/AnalyticsVisitorList';
import OverviewVisitorsCard from '@/features/analytics/components/OverviewVisitorsCard';
import type { AnalyticsRange } from '@/features/analytics/analytics.types';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview';

const chartConfig = {
  images: {
    label: 'Images',
    color: '#c79a31',
  },
  videos: {
    label: 'Videos',
    color: '#5f8599',
  },
  music: {
    label: 'Music',
    color: '#8f7cff',
  },
} satisfies ChartConfig;

const formatBytes = (bytes: number | null | undefined) => {
  if (!bytes) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return 'Unavailable';
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
};

const OverviewPage = () => {
  const [analyticsRange, setAnalyticsRange] = useState<AnalyticsRange>('7d');
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const { error, user } = useAuthSession();
  const { connectDropbox, connectDropboxMutation } = useAuthActions();
  const dashboardQuery = useDashboardOverview();
  const isBusy = connectDropboxMutation.isPending;
  const overview = dashboardQuery.data;
  const storagePercent = overview?.dropbox.usagePercent ?? 0;
  const isDropboxConnected = Boolean(overview?.dropbox.connected && !overview?.dropbox.requiresReconnect);
  const mediaRadarData =
    overview?.media.breakdown.map((item) => ({
      ...item,
      storageBytes: item.sizeBytes,
    })) ?? [];
  const hasMediaStorage = mediaRadarData.some((item) => item.sizeBytes > 0);

  const handleAnalyticsRangeChange = (nextRange: AnalyticsRange) => {
    setAnalyticsRange(nextRange);
    setAnalyticsPage(1);
  };

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {dashboardQuery.error ? (
        <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Unable to load dashboard overview.'}
        </div>
      ) : null}

      <section className="grid gap-5">
        <article className="border border-white/10 bg-[#151818] p-6">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 text-[#c79a31]">
                    <HardDrive className="size-5" />
                    <p className="text-xs uppercase tracking-[0.24em]">Dropbox storage</p>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-[#f2ede4]">
                    {dashboardQuery.isLoading ? 'Loading' : formatPercent(overview?.dropbox.usagePercent)}
                  </p>
                  <p className="mt-2 text-sm text-[#beb7af]">
                    {overview?.dropbox.message
                      ? overview.dropbox.message
                      : overview?.dropbox.connected
                      ? `${formatBytes(overview.dropbox.usedBytes)} used of ${formatBytes(overview.dropbox.allocatedBytes)}`
                      : 'Connect Dropbox to show account quota.'}
                  </p>
                </div>

                <div className="border border-[#3c5362] bg-[#132028]/70 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#d7e7ee]">
                  {overview?.dropbox.requiresReconnect ? 'Reconnect' : overview?.dropbox.allocationType ?? 'Not connected'}
                </div>
              </div>

              <div className="mt-8">
                {dashboardQuery.isLoading ? (
                  <Skeleton className="h-4 w-full bg-white/5" />
                ) : (
                  <div className="h-4 border border-white/10 bg-[#0f1212]">
                    <div
                      className="h-full bg-[#c79a31] transition-[width]"
                      style={{ width: `${Math.min(100, Math.max(0, storagePercent))}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <MetricTile icon={Database} label="App files" value={formatBytes(overview?.media.totalSizeBytes)} />
                <MetricTile icon={Upload} label="Assets" value={(overview?.media.totalCount ?? 0).toLocaleString()} />
                <MetricTile
                  icon={Cloud}
                  label="Dropbox"
                  value={
                    overview?.dropbox.requiresReconnect ? 'Reconnect' : overview?.dropbox.connected ? 'Connected' : 'Disconnected'
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 border border-white/10 bg-[#111414] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8f887e]">Admin account</p>
                  <p className="mt-2 truncate text-sm font-semibold text-[#f2ede4]">
                    {user?.email ?? user?.name ?? user?.id ?? 'Unavailable'}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="border-[#3c5362] bg-[#132028]/92 text-[#d7e7ee] hover:border-[#5f8599] hover:bg-[#1b2d38] hover:text-[#ffffff] sm:shrink-0"
                  onClick={() => void connectDropbox()}
                  disabled={isBusy || isDropboxConnected}
                >
                  <Cloud aria-hidden="true" data-icon="inline-start" />
                  Connect Dropbox
                </Button>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 text-[#c79a31]">
                    <BarChart3 className="size-5" />
                    <p className="text-xs uppercase tracking-[0.24em]">Media by type</p>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[#f2ede4]">Dropbox-backed assets</p>
                </div>
                <p className="text-sm text-[#beb7af]">{formatBytes(overview?.media.totalSizeBytes)} tracked</p>
              </div>

              {dashboardQuery.isLoading ? (
                <Skeleton className="mt-6 h-64 w-full bg-white/5" />
              ) : hasMediaStorage ? (
                <ChartContainer className="mt-6 h-[230px] w-full sm:h-[260px] lg:h-[230px]" config={chartConfig}>
                  <RadarChart data={mediaRadarData} cx="50%" cy="58%" outerRadius="78%">
                    <ChartTooltip content={<ChartTooltipContent valueFormatter={(value) => formatBytes(value)} />} />
                    <PolarGrid gridType="polygon" stroke="rgb(255 255 255 / 0.12)" />
                    <PolarAngleAxis dataKey="label" tick={{ fill: '#beb7af', fontSize: 12 }} />
                    <Radar
                      dataKey="storageBytes"
                      name="Storage"
                      stroke="#c79a31"
                      fill="#c79a31"
                      fillOpacity={0.24}
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#f3cf7a', stroke: '#151818', strokeWidth: 2 }}
                    />
                  </RadarChart>
                </ChartContainer>
              ) : (
                <div className="mt-6 border border-dashed border-white/15 bg-[#121515] px-6 py-14 text-center text-sm text-[#beb7af]">
                  Upload media or music to start building storage analytics.
                </div>
              )}
            </div>
          </div>
        </article>

        <OverviewVisitorsCard />
        <AnalyticsPageViewsChart range={analyticsRange} onRangeChange={handleAnalyticsRangeChange} />
        <AnalyticsVisitorList range={analyticsRange} page={analyticsPage} onPageChange={setAnalyticsPage} />
      </section>
    </div>
  );
};

type MetricTileProps = {
  icon: typeof Database;
  label: string;
  value: string;
};

const MetricTile = ({ icon: Icon, label, value }: MetricTileProps) => (
  <div className="border border-white/10 bg-[#111414] px-4 py-3">
    <div className="flex items-center gap-2 text-[#8f887e]">
      <Icon className="size-4" />
      <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
    </div>
    <p className="mt-3 truncate text-sm font-semibold text-[#f2ede4]">{value}</p>
  </div>
);

export default OverviewPage;
