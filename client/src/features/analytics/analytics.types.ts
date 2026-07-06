export type AnalyticsRange = '7d' | '30d' | '90d';

export type AnalyticsVisitorsTimeseriesPoint = {
  date: string;
  uniqueVisitors: number;
};

export type AnalyticsVisitorsTimeseries = {
  range: AnalyticsRange;
  from: string;
  to: string;
  totalUniqueVisitors: number;
  series: AnalyticsVisitorsTimeseriesPoint[];
};

export type AnalyticsPageViewsTimeseriesPoint = {
  date: string;
  totalPageViews: number;
};

export type AnalyticsPageViewsTimeseries = {
  range: AnalyticsRange;
  from: string;
  to: string;
  totalPageViews: number;
  series: AnalyticsPageViewsTimeseriesPoint[];
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
  range: AnalyticsRange;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  totalVisitors: number;
  totalPages: number;
  visitors: AnalyticsVisitorSummary[];
};
