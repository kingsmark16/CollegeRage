import { Prisma } from '../../generated/prisma/index.js';
import { prisma } from '../../config/db.js';

type SessionUpdateInput = {
  userId?: string | null;
  userEmail?: string | null;
  isAuthenticated: boolean;
  ipHash?: string | null;
  userAgent?: string | null;
  lastSeenAt: Date;
};

type PageViewCreateInput = {
  visitorId: string;
  sessionId: string;
  userId?: string | null;
  userEmail?: string | null;
  path: string;
  title?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  viewportWidth?: number | null;
  viewportHeight?: number | null;
};

export const upsertVisitor = async (visitorKey: string, seenAt: Date) =>
  prisma.analyticsVisitor.upsert({
    where: { visitorKey },
    update: { lastSeenAt: seenAt },
    create: {
      visitorKey,
      firstSeenAt: seenAt,
      lastSeenAt: seenAt,
    },
  });

export const findSessionByKey = async (sessionKey: string) =>
  prisma.analyticsVisitSession.findUnique({
    where: { sessionKey },
  });

export const createSession = async (
  sessionKey: string,
  visitorId: string,
  input: SessionUpdateInput
) =>
  prisma.analyticsVisitSession.create({
    data: {
      sessionKey,
      visitorId,
      userId: input.userId ?? null,
      userEmail: input.userEmail ?? null,
      isAuthenticated: input.isAuthenticated,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
      startedAt: input.lastSeenAt,
      lastSeenAt: input.lastSeenAt,
    },
  });

export const updateSession = async (id: string, input: SessionUpdateInput) =>
  prisma.analyticsVisitSession.update({
    where: { id },
    data: {
      userId: input.userId ?? null,
      userEmail: input.userEmail ?? null,
      isAuthenticated: input.isAuthenticated,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
      lastSeenAt: input.lastSeenAt,
    },
  });

export const createPageView = async (input: PageViewCreateInput) =>
  prisma.analyticsPageView.create({
    data: {
      visitorId: input.visitorId,
      sessionId: input.sessionId,
      userId: input.userId ?? null,
      userEmail: input.userEmail ?? null,
      path: input.path,
      title: input.title ?? null,
      referrer: input.referrer ?? null,
      userAgent: input.userAgent ?? null,
      ipHash: input.ipHash ?? null,
      viewportWidth: input.viewportWidth ?? null,
      viewportHeight: input.viewportHeight ?? null,
    },
  });

export const countPageViews = async (from: Date, to: Date) =>
  prisma.analyticsPageView.count({
    where: {
      occurredAt: {
        gte: from,
        lte: to,
      },
    },
  });

export const countAuthenticatedPageViews = async (from: Date, to: Date) =>
  prisma.analyticsPageView.count({
    where: {
      userId: { not: null },
      occurredAt: {
        gte: from,
        lte: to,
      },
    },
  });

export const countUniqueVisitors = async (from: Date, to: Date) =>
  prisma.analyticsPageView.groupBy({
    by: ['visitorId'],
    where: {
      occurredAt: {
        gte: from,
        lte: to,
      },
    },
  });

export const countSessions = async (from: Date, to: Date) =>
  prisma.analyticsVisitSession.count({
    where: {
      startedAt: {
        lte: to,
      },
      lastSeenAt: {
        gte: from,
      },
    },
  });

export const findTopPages = async (from: Date, to: Date, take = 10) =>
  prisma.analyticsPageView.groupBy({
    by: ['path'],
    where: {
      occurredAt: {
        gte: from,
        lte: to,
      },
    },
    _count: {
      path: true,
    },
    orderBy: {
      _count: {
        path: 'desc',
      },
    },
    take,
  });

type DailyUniqueVisitorsRow = {
  date: string;
  uniqueVisitors: bigint | number;
};

type DailyPageViewsRow = {
  date: string;
  totalPageViews: bigint | number;
};

type VisitorSummaryRow = {
  visitorId: string;
  visitorKey: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  pageViewCount: bigint | number;
  sessionCount: bigint | number;
  isAuthenticated: boolean;
  userEmail: string | null;
  latestPath: string;
  latestTitle: string | null;
  latestOccurredAt: Date;
  ipHash: string | null;
  userAgent: string | null;
};

export const findDailyUniqueVisitors = async (from: Date, to: Date) => {
  const rows = await prisma.$queryRaw<DailyUniqueVisitorsRow[]>(Prisma.sql`
    SELECT
      TO_CHAR(day_bucket.day, 'YYYY-MM-DD') AS "date",
      COUNT(DISTINCT page_view."visitorId") AS "uniqueVisitors"
    FROM generate_series(
      date_trunc('day', ${from}::timestamptz),
      date_trunc('day', ${to}::timestamptz),
      interval '1 day'
    ) AS day_bucket(day)
    LEFT JOIN "AnalyticsPageView" AS page_view
      ON page_view."occurredAt" >= day_bucket.day
      AND page_view."occurredAt" < day_bucket.day + interval '1 day'
      AND page_view."occurredAt" >= ${from}::timestamptz
      AND page_view."occurredAt" <= ${to}::timestamptz
    GROUP BY day_bucket.day
    ORDER BY day_bucket.day ASC
  `);

  return rows.map((row) => ({
    date: row.date,
    uniqueVisitors:
      typeof row.uniqueVisitors === 'bigint' ? Number(row.uniqueVisitors) : row.uniqueVisitors,
  }));
};

export const findDailyPageViews = async (from: Date, to: Date) => {
  const rows = await prisma.$queryRaw<DailyPageViewsRow[]>(Prisma.sql`
    SELECT
      TO_CHAR(day_bucket.day, 'YYYY-MM-DD') AS "date",
      COUNT(page_view.id) AS "totalPageViews"
    FROM generate_series(
      date_trunc('day', ${from}::timestamptz),
      date_trunc('day', ${to}::timestamptz),
      interval '1 day'
    ) AS day_bucket(day)
    LEFT JOIN "AnalyticsPageView" AS page_view
      ON page_view."occurredAt" >= day_bucket.day
      AND page_view."occurredAt" < day_bucket.day + interval '1 day'
      AND page_view."occurredAt" >= ${from}::timestamptz
      AND page_view."occurredAt" <= ${to}::timestamptz
    GROUP BY day_bucket.day
    ORDER BY day_bucket.day ASC
  `);

  return rows.map((row) => ({
    date: row.date,
    totalPageViews:
      typeof row.totalPageViews === 'bigint' ? Number(row.totalPageViews) : row.totalPageViews,
  }));
};

export const countVisitorsInRange = async (from: Date, to: Date) => {
  const [row] = await prisma.$queryRaw<Array<{ total: bigint | number }>>(Prisma.sql`
    SELECT COUNT(DISTINCT page_view."visitorId") AS total
    FROM "AnalyticsPageView" AS page_view
    WHERE page_view."occurredAt" >= ${from}::timestamptz
      AND page_view."occurredAt" <= ${to}::timestamptz
  `);

  if (!row) {
    return 0;
  }

  return typeof row.total === 'bigint' ? Number(row.total) : row.total;
};

export const findVisitorSummaries = async (
  from: Date,
  to: Date,
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;
  const rows = await prisma.$queryRaw<VisitorSummaryRow[]>(Prisma.sql`
    WITH filtered_page_views AS (
      SELECT
        page_view.*,
        ROW_NUMBER() OVER (
          PARTITION BY page_view."visitorId"
          ORDER BY page_view."occurredAt" DESC, page_view.id DESC
        ) AS latest_rank
      FROM "AnalyticsPageView" AS page_view
      WHERE page_view."occurredAt" >= ${from}::timestamptz
        AND page_view."occurredAt" <= ${to}::timestamptz
    ),
    visitor_counts AS (
      SELECT
        filtered."visitorId",
        COUNT(*) AS "pageViewCount",
        COUNT(DISTINCT filtered."sessionId") AS "sessionCount",
        BOOL_OR(filtered."userId" IS NOT NULL) AS "isAuthenticated",
        MAX(filtered."occurredAt") AS "lastSeenAt"
      FROM filtered_page_views AS filtered
      GROUP BY filtered."visitorId"
    ),
    latest_page_views AS (
      SELECT
        filtered."visitorId",
        filtered."userEmail",
        filtered.path AS "latestPath",
        filtered.title AS "latestTitle",
        filtered."occurredAt" AS "latestOccurredAt",
        filtered."ipHash",
        filtered."userAgent"
      FROM filtered_page_views AS filtered
      WHERE filtered.latest_rank = 1
    )
    SELECT
      visitor.id AS "visitorId",
      visitor."visitorKey",
      visitor."firstSeenAt",
      counts."lastSeenAt",
      counts."pageViewCount",
      counts."sessionCount",
      counts."isAuthenticated",
      latest."userEmail",
      latest."latestPath",
      latest."latestTitle",
      latest."latestOccurredAt",
      latest."ipHash",
      latest."userAgent"
    FROM visitor_counts AS counts
    INNER JOIN "AnalyticsVisitor" AS visitor
      ON visitor.id = counts."visitorId"
    INNER JOIN latest_page_views AS latest
      ON latest."visitorId" = counts."visitorId"
    ORDER BY counts."lastSeenAt" DESC, visitor.id DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `);

  return rows.map((row) => ({
    ...row,
    pageViewCount: typeof row.pageViewCount === 'bigint' ? Number(row.pageViewCount) : row.pageViewCount,
    sessionCount: typeof row.sessionCount === 'bigint' ? Number(row.sessionCount) : row.sessionCount,
  }));
};
