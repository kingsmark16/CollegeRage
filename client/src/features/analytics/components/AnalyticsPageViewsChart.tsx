import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { AnalyticsRange } from '../analytics.types';
import { usePageViewsTimeseries } from '../hooks/usePageViewsTimeseries';

const chartConfig = {
  totalPageViews: {
    label: 'Page views',
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

type AnalyticsPageViewsChartProps = {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
};

const AnalyticsPageViewsChart = ({ range, onRangeChange }: AnalyticsPageViewsChartProps) => {
  const pageViewsQuery = usePageViewsTimeseries(range);
  const chartData = pageViewsQuery.data?.series ?? [];

  const peakValue = useMemo(
    () => chartData.reduce((max, item) => Math.max(max, item.totalPageViews), 0),
    [chartData]
  );

  return (
    <article className="border border-white/10 bg-[#151818] p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3 text-[#c79a31]">
              <Activity className="size-5" />
              <p className="text-xs uppercase tracking-[0.24em]">Page views</p>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[#f2ede4]">Page views over time</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#beb7af]">
              A daily trend of all tracked frontend page views across both anonymous visitors and authenticated admin traffic.
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
                  onClick={() => onRangeChange(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {pageViewsQuery.error ? (
          <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageViewsQuery.error instanceof Error ? pageViewsQuery.error.message : 'Unable to load page views.'}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile
            label="Total page views"
            value={(pageViewsQuery.data?.totalPageViews ?? 0).toLocaleString()}
          />
          <MetricTile label="Peak day" value={peakValue.toLocaleString()} />
          <MetricTile label="Range" value={range.toUpperCase()} />
        </div>

        {pageViewsQuery.isLoading ? (
          <Skeleton className="h-[310px] w-full bg-white/5" />
        ) : chartData.length > 0 ? (
          <ChartContainer className="h-[310px] w-full" config={chartConfig}>
            <LineChart data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
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
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatDateLabel(String(label))}
                    valueFormatter={(value) => `${value.toLocaleString()} views`}
                  />
                }
              />
              <Line
                dataKey="totalPageViews"
                name="Page views"
                type="monotone"
                stroke="var(--color-totalPageViews)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0, fill: '#f3cf7a' }}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="border border-dashed border-white/15 bg-[#121515] px-6 py-14 text-center text-sm text-[#beb7af]">
            No page views have been tracked yet for this range.
          </div>
        )}
      </div>
    </article>
  );
};

const MetricTile = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-white/10 bg-[#111414] px-4 py-3">
    <p className="text-xs uppercase tracking-[0.18em] text-[#8f887e]">{label}</p>
    <p className="mt-3 text-xl font-semibold text-[#f2ede4]">{value}</p>
  </div>
);

export default AnalyticsPageViewsChart;
