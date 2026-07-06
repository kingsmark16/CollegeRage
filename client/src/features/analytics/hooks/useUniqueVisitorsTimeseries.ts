import { useQuery } from '@tanstack/react-query';
import { getUniqueVisitorsTimeseries } from '@/services/analytics.service';
import type { AnalyticsRange } from '../analytics.types';

export const uniqueVisitorsTimeseriesQueryKey = (range: AnalyticsRange) =>
  ['analytics', 'unique-visitors-timeseries', range] as const;

export const useUniqueVisitorsTimeseries = (range: AnalyticsRange) =>
  useQuery({
    queryKey: uniqueVisitorsTimeseriesQueryKey(range),
    queryFn: () => getUniqueVisitorsTimeseries(range),
  });
