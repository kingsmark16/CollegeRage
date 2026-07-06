import type { CSSProperties, ReactNode } from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

export type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

type ChartContainerProps = {
  children: ReactNode;
  className?: string;
  config: ChartConfig;
};

export const ChartContainer = ({ children, className, config }: ChartContainerProps) => {
  const chartVars = Object.entries(config).reduce<Record<string, string>>((variables, [key, item]) => {
    variables[`--color-${key}`] = item.color;
    return variables;
  }, {});

  return (
    <div
      className={cn('h-[260px] w-full text-xs text-[#beb7af] [&_.recharts-cartesian-axis-tick_text]:fill-[#8f887e]', className)}
      style={chartVars as CSSProperties}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

type ChartTooltipPayloadItem = {
  dataKey?: string | number;
  name?: string | number;
  value?: string | number;
};

type ChartTooltipContentProps = {
  active?: boolean;
  label?: ReactNode;
  payload?: ChartTooltipPayloadItem[];
  valueFormatter?: (value: number, name: string) => string;
};

export const ChartTooltip = Tooltip;

export const ChartTooltipContent = ({ active, label, payload, valueFormatter }: ChartTooltipContentProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="min-w-36 border border-white/10 bg-[#101313] px-3 py-2 text-xs text-[#f2ede4] shadow-2xl">
      {label ? <p className="mb-2 font-semibold text-[#f2ede4]">{label}</p> : null}
      <div className="grid gap-1.5">
        {payload.map((item) => {
          const value = typeof item.value === 'number' ? item.value : Number(item.value ?? 0);
          const name = String(item.name ?? item.dataKey ?? '');

          return (
            <div key={`${name}-${value}`} className="flex items-center justify-between gap-4">
              <span className="text-[#beb7af]">{name}</span>
              <span className="font-medium text-[#f3cf7a]">
                {valueFormatter ? valueFormatter(value, name) : value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
