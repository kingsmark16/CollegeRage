import multer from 'multer';
import type { Request } from 'express';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import AppError from '../../common/errors/AppError.js';
import { createMediaTempDirectory, ensureDirectory } from '../../common/utils/file.js';
import { MAX_MEDIA_FILES, VIDEO_MAX_BYTES } from './media.constants.js';
import { getFileExtension, resolveMediaKind } from './media.validation.js';

const storage = multer.diskStorage({
  destination: async (_req, _file, callback) => {
    try {
      const directory = await createMediaTempDirectory();
      await ensureDirectory(directory);
      callback(null, directory);
    } catch (error) {
      callback(error as Error, '');
    }
  },
  filename: (_req, file, callback) => {
    try {
      const extension = getFileExtension(file.originalname);
      callback(null, `${randomUUID()}.${extension}`);
    } catch (error) {
      callback(error as Error, '');
    }
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  try {
    const extension = getFileExtension(file.originalname);
    resolveMediaKind(file.mimetype, extension);
    callback(null, true);
  } catch (error) {
    callback(error as AppError);
  }
};

export const uploadMediaFiles = multer({
  storage,
  fileFilter,
  limits: {
    files: MAX_MEDIA_FILES,
    fileSize: VIDEO_MAX_BYTES,
  },
}).array('files', MAX_MEDIA_FILES);

export const getUploadedFiles = (req: Request) => {
  if (!Array.isArray(req.files)) {
    return [];
  }

  return req.files.filter((file) => path.isAbsolute(file.path) || file.path.length > 0);
};
