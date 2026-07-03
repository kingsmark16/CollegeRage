import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../middlewares/auth.middleware.js';
import * as analyticsController from '../../modules/analytics/analytics.controller.js';

const router = Router();

router.post('/page-view', optionalAuth, analyticsController.trackPageView);
router.get('/metrics', requireAuth, analyticsController.getMetrics);

export default router;
