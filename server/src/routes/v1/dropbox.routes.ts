import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import {
  handleDropboxCallback,
  startDropboxAuthorization,
} from '../../modules/dropbox/dropbox.controller.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'dropbox',
  });
});
router.get('/start', requireAuth, startDropboxAuthorization);
router.get('/callback', handleDropboxCallback);

export default router;
