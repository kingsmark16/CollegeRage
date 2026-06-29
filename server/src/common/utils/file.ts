import { createReadStream } from 'node:fs';
import { mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import AppError from '../errors/AppError.js';
import env from '../../config/env.js';

export const getMediaTempRoot = () => path.resolve(env.MEDIA_TEMP_DIR || path.join(tmpdir(), 'college-rage-media'));

export const createMediaTempDirectory = async () => {
  const directory = path.join(getMediaTempRoot(), randomUUID());
  await mkdir(directory, { recursive: true });
  return directory;
};

export const ensureDirectory = async (directory: string) => {
  await mkdir(directory, { recursive: true });
};

export const cleanupPath = async (targetPath?: string) => {
  if (!targetPath) {
    return;
  }

  await rm(targetPath, { recursive: true, force: true });
};

export const getFileSize = async (filePath: string) => {
  const fileStats = await stat(filePath);
  return fileStats.size;
};

export const safeJoin = (root: string, ...segments: string[]) => {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, ...segments);

  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new AppError('Invalid file path.', 400);
  }

  return resolvedPath;
};

export const streamFile = (filePath: string) => createReadStream(filePath);
