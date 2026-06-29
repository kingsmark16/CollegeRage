import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dropboxRoutes from './dropbox.routes.js';
import mediaRoutes from './media.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dropbox', dropboxRoutes);
router.use('/media', mediaRoutes);

export default router;
