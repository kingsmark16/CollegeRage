import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import * as dashboardController from '../../modules/dashboard/dashboard.controller.js';

const router = Router();

router.get('/overview', requireAuth, dashboardController.getOverview);

export default router;
