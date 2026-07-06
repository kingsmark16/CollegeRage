import { authenticatedRequest, getApiErrorMessage } from './api.service';
import type { DashboardOverviewMetrics } from '@/features/dashboard/dashboard.types';

export const getDashboardOverview = async () => {
  try {
    return await authenticatedRequest<DashboardOverviewMetrics>('/dashboard/overview', {
      method: 'GET',
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load dashboard overview.'), { cause: error });
  }
};
