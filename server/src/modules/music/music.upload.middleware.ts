import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import AppError from '../../common/errors/AppError.js';
import { createMediaTempDirectory, ensureDirectory } from '../../common/utils/file.js';
import { getFileExtension } from '../media/media.validation.js';
import { MAX_MUSIC_FILES, MUSIC_MAX_BYTES } from './music.constants.js';
import { assertMusicFileType } from './music.validation.js';

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
    assertMusicFileType(file.mimetype, extension);
    callback(null, true);
  } catch (error) {
    callback(error as AppError);
  }
};

export const uploadMusicFile = multer({
  storage,
  fileFilter,
  limits: {
    files: MAX_MUSIC_FILES,
    fileSize: MUSIC_MAX_BYTES,
  },
}).single('file');

export const getUploadedMusicFile = (req: Request) => {
  const file = req.file;

  if (!file || (!path.isAbsolute(file.path) && file.path.length === 0)) {
    return null;
  }

  return file;
};
