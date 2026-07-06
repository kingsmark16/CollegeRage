import type { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { sendSuccess } from '../../common/utils/response.js';
import { getDashboardOverviewMetrics } from './dashboard.service.js';

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const metrics = await getDashboardOverviewMetrics();

  sendSuccess(res, metrics);
});
