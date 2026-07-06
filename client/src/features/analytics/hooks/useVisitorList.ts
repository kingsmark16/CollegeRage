import { useQuery } from '@tanstack/react-query';
import { getVisitorList } from '@/services/analytics.service';
import type { AnalyticsRange } from '../analytics.types';

export const visitorListQueryKey = (range: AnalyticsRange, page: number, pageSize: number) =>
  ['analytics', 'visitors', range, page, pageSize] as const;

export const useVisitorList = (range: AnalyticsRange, page: number, pageSize: number) =>
  useQuery({
    queryKey: visitorListQueryKey(range, page, pageSize),
    queryFn: () => getVisitorList(range, page, pageSize),
    placeholderData: (previousData) => previousData,
  });
