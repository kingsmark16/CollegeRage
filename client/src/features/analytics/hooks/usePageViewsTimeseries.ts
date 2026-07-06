import { useQuery } from '@tanstack/react-query';
import { getPageViewsTimeseries } from '@/services/analytics.service';
import type { AnalyticsRange } from '../analytics.types';

export const pageViewsTimeseriesQueryKey = (range: AnalyticsRange) =>
  ['analytics', 'page-views-timeseries', range] as const;

export const usePageViewsTimeseries = (range: AnalyticsRange) =>
  useQuery({
    queryKey: pageViewsTimeseriesQueryKey(range),
    queryFn: () => getPageViewsTimeseries(range),
  });
