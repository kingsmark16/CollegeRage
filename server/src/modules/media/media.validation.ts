import path from 'node:path';
import { readFile } from 'node:fs/promises';
import AppError from '../../common/errors/AppError.js';
import {
  BLOCKED_EXTENSIONS,
  IMAGE_EXTENSIONS,
  IMAGE_MAX_BYTES,
  IMAGE_MIME_TYPES,
  VIDEO_EXTENSIONS,
  VIDEO_MAX_BYTES,
  VIDEO_MIME_TYPES,
} from './media.constants.js';
import type { ImageMetadata, MediaKind } from './media.types.js';

const imageExtensionSet = new Set<string>(IMAGE_EXTENSIONS);
const videoExtensionSet = new Set<string>(VIDEO_EXTENSIONS);
const imageMimeTypeSet = new Set<string>(IMAGE_MIME_TYPES);
const videoMimeTypeSet = new Set<string>(VIDEO_MIME_TYPES);

export const getFileExtension = (filename: string) => {
  const extension = path.extname(filename).replace('.', '').toLowerCase();

  if (!extension || BLOCKED_EXTENSIONS.has(extension)) {
    throw new AppError('Unsupported file extension.', 400);
  }

  return extension;
};

export const sanitizeFilename = (filename: string) => {
  const basename = path.basename(filename).replace(/\.[^.]+$/, '');
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 180);
  return sanitized || 'upload';
};

export const resolveMediaKind = (mimeType: string, extension: string): MediaKind => {
  if (imageMimeTypeSet.has(mimeType) && imageExtensionSet.has(extension)) {
    return 'image';
  }

  if (videoMimeTypeSet.has(mimeType) && videoExtensionSet.has(extension)) {
    return 'video';
  }

  throw new AppError('Unsupported media type.', 400);
};

export const assertFileSize = (mediaType: MediaKind, sizeBytes: number) => {
  const maxBytes = mediaType === 'image' ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;

  if (sizeBytes <= 0) {
    throw new AppError('Uploaded file is empty.', 400);
  }

  if (sizeBytes > maxBytes) {
    throw new AppError(`${mediaType === 'image' ? 'Image' : 'Video'} file size limit exceeded.`, 413);
  }
};

export const readImageMetadata = async (filePath: string, mimeType: string): Promise<ImageMetadata> => {
  const header = await readFile(filePath, { encoding: null }).then((buffer) => buffer.subarray(0, 512));

  if (mimeType === 'image/png') {
    if (header.length < 24 || header.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      throw new AppError('Invalid or corrupted PNG image.', 400);
    }

    return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
  }

  if (mimeType === 'image/gif') {
    const signature = header.toString('ascii', 0, 6);
    if (header.length < 10 || (signature !== 'GIF87a' && signature !== 'GIF89a')) {
      throw new AppError('Invalid or corrupted GIF image.', 400);
    }

    return { width: header.readUInt16LE(6), height: header.readUInt16LE(8) };
  }

  if (mimeType === 'image/webp') {
    if (header.length < 16 || header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WEBP') {
      throw new AppError('Invalid or corrupted WEBP image.', 400);
    }

    return {};
  }

  if (mimeType === 'image/jpeg') {
    if (header.length < 3 || header[0] !== 0xff || header[1] !== 0xd8) {
      throw new AppError('Invalid or corrupted JPEG image.', 400);
    }

    return {};
  }

  throw new AppError('Unsupported image MIME type.', 400);
};
