import { createHash, randomUUID } from 'node:crypto';
import AppError from '../../common/errors/AppError.js';
import env from '../../config/env.js';
import {
  countAuthenticatedPageViews,
  countPageViews,
  countSessions,
  countUniqueVisitors,
  createPageView,
  createSession,
  findSessionByKey,
  findTopPages,
  updateSession,
  upsertVisitor,
} from './analytics.repository.js';
import { analyticsMetricsQuerySchema, pageViewEventSchema } from './analytics.schema.js';
import type { AnalyticsMetricsQuery } from './analytics.schema.js';
import type { AnalyticsMetrics, TrackPageViewInput } from './analytics.types.js';

const uuidLikePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeCookieUuid = (value?: string) => {
  if (!value || !uuidLikePattern.test(value)) {
    return randomUUID();
  }

  return value;
};

const getIpHash = (ipAddress?: string) => {
  if (!ipAddress) {
    return null;
  }

  const salt =
    env.ANALYTICS_IP_SALT ||
    env.DROPBOX_TOKEN_ENCRYPTION_KEY ||
    env.DROPBOX_CLIENT_SECRET ||
    'college-rage-development-analytics-salt';

  return createHash('sha256').update(`${salt}:${ipAddress}`).digest('hex');
};

const isSessionFresh = (lastSeenAt: Date, now: Date) => {
  const ttlMilliseconds = env.ANALYTICS_SESSION_TTL_MINUTES * 60 * 1000;
  return now.getTime() - lastSeenAt.getTime() <= ttlMilliseconds;
};

const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  return { from, to };
};

const resolveDateRange = (query: unknown) => {
  const parsedQuery: AnalyticsMetricsQuery = analyticsMetricsQuerySchema.parse(query);
  const defaults = getDefaultDateRange();
  const from = parsedQuery.from ?? defaults.from;
  const to = parsedQuery.to ?? defaults.to;

  if (from > to) {
    throw new AppError('The from date must be before the to date.', 400);
  }

  return { from, to };
};

export const trackPageView = async ({ event, context }: TrackPageViewInput) => {
  const parsedEvent = pageViewEventSchema.parse(event);
  const now = new Date();
  const visitorKey = normalizeCookieUuid(context.visitorKey);
  let sessionKey = normalizeCookieUuid(context.sessionKey);
  const visitor = await upsertVisitor(visitorKey, now);
  const existingSession = await findSessionByKey(sessionKey);
  const sessionBelongsToVisitor = existingSession?.visitorId === visitor.id;
  const shouldReuseSession =
    Boolean(existingSession) &&
    sessionBelongsToVisitor &&
    isSessionFresh(existingSession.lastSeenAt, now);
  const userId = context.user?.id ?? null;
  const userEmail = context.user?.email ?? null;
  const sessionInput = {
    userId,
    userEmail,
    isAuthenticated: Boolean(userId),
    ipHash: getIpHash(context.ipAddress),
    userAgent: context.userAgent ?? null,
    lastSeenAt: now,
  };
  const session = shouldReuseSession && existingSession
    ? await updateSession(existingSession.id, sessionInput)
    : await createSession((sessionKey = randomUUID()), visitor.id, sessionInput);

  await createPageView({
    visitorId: visitor.id,
    sessionId: session.id,
    userId,
    userEmail,
    path: parsedEvent.path,
    title: parsedEvent.title?.trim() || null,
    referrer: parsedEvent.referrer?.trim() || null,
    userAgent: context.userAgent ?? null,
    ipHash: sessionInput.ipHash,
    viewportWidth: parsedEvent.viewportWidth ?? null,
    viewportHeight: parsedEvent.viewportHeight ?? null,
  });

  return {
    visitorKey,
    sessionKey,
  };
};

export const getAnalyticsMetrics = async (query: unknown): Promise<AnalyticsMetrics> => {
  const { from, to } = resolveDateRange(query);
  const [
    totalPageViews,
    authenticatedPageViews,
    uniqueVisitors,
    sessions,
    topPages,
  ] = await Promise.all([
    countPageViews(from, to),
    countAuthenticatedPageViews(from, to),
    countUniqueVisitors(from, to),
    countSessions(from, to),
    findTopPages(from, to),
  ]);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    totalPageViews,
    uniqueVisitors: uniqueVisitors.length,
    sessions,
    authenticatedPageViews,
    anonymousPageViews: totalPageViews - authenticatedPageViews,
    topPages: topPages.map((page) => ({
      path: page.path,
      views: page._count.path,
    })),
  };
};
