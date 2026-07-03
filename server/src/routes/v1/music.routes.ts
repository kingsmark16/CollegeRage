import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import {
  deleteMusicTrack,
  getAdminMusicTracks,
  getPublicMusicTracks,
  updateMusicTrack,
  uploadMusicTrack,
} from '../../modules/music/music.controller.js';
import { uploadMusicFile } from '../../modules/music/music.upload.middleware.js';

const router = Router();

router.get('/', getPublicMusicTracks);
router.get('/admin', requireAuth, getAdminMusicTracks);
router.post('/admin', requireAuth, uploadMusicFile, uploadMusicTrack);
router.put('/admin/:id', requireAuth, updateMusicTrack);
router.delete('/admin/:id', requireAuth, deleteMusicTrack);

export default router;
