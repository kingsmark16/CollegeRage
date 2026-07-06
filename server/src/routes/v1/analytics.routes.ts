import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middlewares/auth.middleware.js';
import * as analyticsController from '../../modules/analytics/analytics.controller.js';

const router = Router();

router.post('/page-view', optionalAuth, analyticsController.trackPageView);
router.get('/metrics', requireAuth, analyticsController.getMetrics);
router.get('/visitors-timeseries', requireAuth, analyticsController.getUniqueVisitorsTimeseries);
router.get('/page-views-timeseries', requireAuth, analyticsController.getPageViewsTimeseries);
router.get('/visitors', requireAuth, analyticsController.getVisitorList);

export default router;
