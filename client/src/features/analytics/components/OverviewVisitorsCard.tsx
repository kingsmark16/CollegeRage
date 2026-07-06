import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Activity, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AnalyticsRange } from '../analytics.types';
import { useUniqueVisitorsTimeseries } from '../hooks/useUniqueVisitorsTimeseries';

const chartConfig = {
  uniqueVisitors: {
    label: 'Unique visitors',
    color: '#c79a31',
  },
} satisfies ChartConfig;

const rangeOptions: Array<{ label: string; value: AnalyticsRange }> = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
];

const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

const OverviewVisitorsCard = () => {
  const [range, setRange] = useState<AnalyticsRange>('7d');
  const visitorsQuery = useUniqueVisitorsTimeseries(range);

  const chartData = visitorsQuery.data?.series ?? [];
  const totalUniqueVisitors = visitorsQuery.data?.totalUniqueVisitors ?? 0;
  const peakDayVisitors = useMemo(
    () => chartData.reduce((max, item) => Math.max(max, item.uniqueVisitors), 0),
    [chartData]
  );

  return (
    <article className="border border-white/10 bg-[#151818] p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[#c79a31]">
              <Activity className="size-5" />
              <p className="text-xs uppercase tracking-[0.24em]">Visitor activity</p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#f2ede4]">Unique visitors over time</h2>
            <p className="mt-2 text-sm text-[#beb7af]">
              Daily unique visitors across admin and anonymous traffic, based on recorded frontend page views.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start">
            {rangeOptions.map((option) => {
              const isActive = range === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  className={cn(
                    'border-white/10 bg-[#121515] text-[#beb7af] hover:border-[#5f8599] hover:bg-[#1a232b] hover:text-[#f2ede4]',
                    isActive && 'border-[#3c5362] bg-[#132028]/92 text-[#d7e7ee]'
                  )}
                  onClick={() => setRange(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {visitorsQuery.error ? (
          <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {visitorsQuery.error instanceof Error ? visitorsQuery.error.message : 'Unable to load visitor trends.'}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[220px_220px_1fr]">
          <MetricTile label="Unique visitors" value={totalUniqueVisitors.toLocaleString()} icon={Users} />
          <MetricTile label="Peak day" value={peakDayVisitors.toLocaleString()} icon={Activity} />
          <div className="flex items-center border border-white/10 bg-[#111414] px-4 py-3 text-sm text-[#beb7af]">
            <p>
              Range: <span className="font-semibold text-[#f2ede4]">{range.toUpperCase()}</span>
            </p>
          </div>
        </div>

        {visitorsQuery.isLoading ? (
          <Skeleton className="h-[300px] w-full bg-white/5" />
        ) : chartData.length > 0 ? (
          <ChartContainer className="h-[300px] w-full" config={chartConfig}>
            <AreaChart data={chartData} margin={{ top: 16, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="fillUniqueVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="var(--color-uniqueVisitors)" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgb(255 255 255 / 0.08)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={24}
                tickFormatter={formatDateLabel}
              />
              <YAxis axisLine={false} tickLine={false} width={32} allowDecimals={false} />
              <ChartTooltip
                cursor={{ stroke: 'rgb(199 154 49 / 0.45)', strokeDasharray: '4 4' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatDateLabel(String(label))}
                    valueFormatter={(value) => `${value.toLocaleString()} visitors`}
                  />
                }
              />
              <Area
                dataKey="uniqueVisitors"
                name="Unique visitors"
                type="monotone"
                stroke="var(--color-uniqueVisitors)"
                fill="url(#fillUniqueVisitors)"
                strokeWidth={2}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#f3cf7a' }}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="border border-dashed border-white/15 bg-[#121515] px-6 py-14 text-center text-sm text-[#beb7af]">
            No visitor activity has been tracked yet for this range.
          </div>
        )}
      </div>
    </article>
  );
};

type MetricTileProps = {
  label: string;
  value: string;
  icon: typeof Users;
};

const MetricTile = ({ label, value, icon: Icon }: MetricTileProps) => (
  <div className="border border-white/10 bg-[#111414] px-4 py-3">
    <div className="flex items-center gap-2 text-[#8f887e]">
      <Icon className="size-4" />
      <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
    </div>
    <p className="mt-3 text-xl font-semibold text-[#f2ede4]">{value}</p>
  </div>
);

export default OverviewVisitorsCard;
