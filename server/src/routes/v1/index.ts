import { Router } from 'express';
import analyticsRoutes from './analytics.routes.js';
import authRoutes from './auth.routes.js';
import dropboxRoutes from './dropbox.routes.js';
import mediaRoutes from './media.routes.js';
import musicRoutes from './music.routes.js';

const router = Router();

router.use('/analytics', analyticsRoutes);
router.use('/auth', authRoutes);
router.use('/dropbox', dropboxRoutes);
router.use('/media', mediaRoutes);
router.use('/music', musicRoutes);

export default router;
