import type { NeonAuthUser } from '../auth/auth.types.js';
import type { AnalyticsVisitorsTimeseriesRange, PageViewEventInput } from './analytics.schema.js';

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

export type AnalyticsVisitorsTimeseriesPoint = {
  date: string;
  uniqueVisitors: number;
  totalPageViews?: number;
};

export type AnalyticsVisitorsTimeseries = {
  range: AnalyticsVisitorsTimeseriesRange;
  from: string;
  to: string;
  totalUniqueVisitors: number;
  series: AnalyticsVisitorsTimeseriesPoint[];
};

export type AnalyticsPageViewsTimeseries = {
  range: AnalyticsVisitorsTimeseriesRange;
  from: string;
  to: string;
  totalPageViews: number;
  series: Array<{
    date: string;
    totalPageViews: number;
  }>;
};

export type AnalyticsVisitorSummary = {
  visitorId: string;
  visitorKey: string;
  firstSeenAt: string;
  lastSeenAt: string;
  pageViewCount: number;
  sessionCount: number;
  isAuthenticated: boolean;
  userEmail: string | null;
  latestPath: string;
  latestTitle: string | null;
  latestOccurredAt: string;
  ipHash: string | null;
  userAgent: string | null;
};

export type AnalyticsVisitorList = {
  range: AnalyticsVisitorsTimeseriesRange;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  totalVisitors: number;
  totalPages: number;
  visitors: AnalyticsVisitorSummary[];
};
