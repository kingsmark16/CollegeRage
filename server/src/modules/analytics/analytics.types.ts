import type { NeonAuthUser } from '../auth/auth.types.js';
import type { PageViewEventInput } from './analytics.schema.js';

export type AnalyticsRequestContext = {
  visitorKey?: string | undefined;
  sessionKey?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  user?: NeonAuthUser | undefined;
};

export type TrackPageViewInput = {
  event: PageViewEventInput;
  context: AnalyticsRequestContext;
};

export type TrackPageViewResult = {
  visitorKey: string;
  sessionKey: string;
};

export type AnalyticsMetrics = {
  from: string;
  to: string;
  totalPageViews: number;
  uniqueVisitors: number;
  sessions: number;
  authenticatedPageViews: number;
  anonymousPageViews: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
};
