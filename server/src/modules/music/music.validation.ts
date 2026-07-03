import AppError from '../../common/errors/AppError.js';
import { MUSIC_EXTENSIONS, MUSIC_MAX_BYTES, MUSIC_MIME_TYPES } from './music.constants.js';

const musicExtensionSet = new Set<string>(MUSIC_EXTENSIONS);
const musicMimeTypeSet = new Set<string>(MUSIC_MIME_TYPES);

export const assertMusicFileType = (mimeType: string, extension: string) => {
  if (!musicMimeTypeSet.has(mimeType) || !musicExtensionSet.has(extension)) {
    throw new AppError('Unsupported music file type.', 400);
  }
};

export const assertMusicFileSize = (sizeBytes: number) => {
  if (sizeBytes <= 0) {
    throw new AppError('Uploaded music file is empty.', 400);
  }

  if (sizeBytes > MUSIC_MAX_BYTES) {
    throw new AppError('Music file size limit exceeded.', 413);
  }
};
