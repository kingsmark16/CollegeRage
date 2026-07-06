import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { parseCookies, setHttpOnlyCookie } from '../../common/utils/cookies.js';
import { sendSuccess } from '../../common/utils/response.js';
import env from '../../config/env.js';
import * as analyticsService from './analytics.service.js';

export const trackPageView = asyncHandler(async (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const result = await analyticsService.trackPageView({
    event: req.body,
    context: {
      visitorKey: cookies.get(env.ANALYTICS_COOKIE_NAME),
      sessionKey: cookies.get(env.ANALYTICS_SESSION_COOKIE_NAME),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      user: req.user,
    },
  });

  setHttpOnlyCookie(res, env.ANALYTICS_COOKIE_NAME, result.visitorKey);
  setHttpOnlyCookie(
    res,
    env.ANALYTICS_SESSION_COOKIE_NAME,
    result.sessionKey,
    env.ANALYTICS_SESSION_TTL_MINUTES * 60
  );

  sendSuccess(res, { tracked: true }, 201);
});

export const getMetrics = asyncHandler(async (req: Request, res: Response) => {
  const metrics = await analyticsService.getAnalyticsMetrics(req.query);

  sendSuccess(res, metrics);
});

export const getUniqueVisitorsTimeseries = asyncHandler(async (req: Request, res: Response) => {
  const timeseries = await analyticsService.getAnalyticsVisitorsTimeseries(req.query);

  sendSuccess(res, timeseries);
});

export const getPageViewsTimeseries = asyncHandler(async (req: Request, res: Response) => {
  const timeseries = await analyticsService.getAnalyticsPageViewsTimeseries(req.query);

  sendSuccess(res, timeseries);
});

export const getVisitorList = asyncHandler(async (req: Request, res: Response) => {
  const visitorList = await analyticsService.getAnalyticsVisitorList(req.query);

  sendSuccess(res, visitorList);
});
