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
