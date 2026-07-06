import { apiClient, authenticatedRequest, getApiErrorMessage } from './api.service';
import { getOptionalAuthToken } from './auth.service';
import type {
  AnalyticsPageViewsTimeseries,
  AnalyticsRange,
  AnalyticsVisitorList,
  AnalyticsVisitorsTimeseries,
} from '@/features/analytics/analytics.types';

type PageViewEvent = {
  path: string;
  title?: string;
  referrer?: string;
  viewportWidth?: number;
  viewportHeight?: number;
};

export const trackPageView = async (event: PageViewEvent) => {
  const token = await getOptionalAuthToken();
  try {
    await apiClient.post('/analytics/page-view', event, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to track page view.'), {
      cause: error,
    });
  }
};

export const getUniqueVisitorsTimeseries = async (range: AnalyticsRange = '7d') => {
  try {
    return await authenticatedRequest<AnalyticsVisitorsTimeseries>(`/analytics/visitors-timeseries?range=${range}`, {
      method: 'GET',
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load visitor trends.'), {
      cause: error,
    });
  }
};

export const getPageViewsTimeseries = async (range: AnalyticsRange = '7d') => {
  try {
    return await authenticatedRequest<AnalyticsPageViewsTimeseries>(`/analytics/page-views-timeseries?range=${range}`, {
      method: 'GET',
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load page-view trends.'), {
      cause: error,
    });
  }
};

export const getVisitorList = async (range: AnalyticsRange = '7d', page = 1, pageSize = 10) => {
  try {
    return await authenticatedRequest<AnalyticsVisitorList>(
      `/analytics/visitors?range=${range}&page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
      }
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load visitors.'), {
      cause: error,
    });
  }
};
