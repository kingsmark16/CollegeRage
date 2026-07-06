import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '@/services/dashboard.service';

export const dashboardOverviewQueryKey = ['dashboard', 'overview'] as const;

export const useDashboardOverview = () =>
  useQuery({
    queryKey: dashboardOverviewQueryKey,
    queryFn: getDashboardOverview,
  });
