import { Router } from 'express';
import { getMe } from '../../modules/auth/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getMe);

export default router;
