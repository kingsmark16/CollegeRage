import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import {
  deleteMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  uploadMedia,
} from '../../modules/media/media.controller.js';
import { uploadMediaFiles } from '../../modules/media/media.upload.middleware.js';

const router = Router();

router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.post('/', requireAuth, uploadMediaFiles, uploadMedia);
router.put('/:id', requireAuth, updateMedia);
router.delete('/:id', requireAuth, deleteMedia);

export default router;
