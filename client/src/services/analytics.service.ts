import { apiClient, getApiErrorMessage } from './api.service';
import { getOptionalAuthToken } from './auth.service';

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
