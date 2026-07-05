import path from 'node:path';
import { randomUUID } from 'node:crypto';
import AppError from '../../common/errors/AppError.js';
import { cleanupPath } from '../../common/utils/file.js';
import type { Prisma } from '../../generated/prisma/index.js';
import { buildDropboxPath, deleteFilesFromDropbox, uploadFileToDropbox } from '../../services/dropbox.service.js';
import { probeAudio } from '../../services/ffmpeg.service.js';
import { assertAdminUser } from '../auth/auth.service.js';
import type { NeonAuthUser } from '../auth/auth.types.js';
import { getFileExtension, sanitizeFilename } from '../media/media.validation.js';
import {
  createMusicTrack,
  deleteMusicTrackById,
  findAllMusicTracks,
  findMusicTrackById,
  findPublicMusicTracks,
  updateMusicTrackById,
} from './music.repository.js';
import { createMusicTrackSchema, musicUploadFileSchema, updateMusicTrackSchema } from './music.schema.js';
import { assertMusicFileSize, assertMusicFileType } from './music.validation.js';
import type { MusicTrackEntity, MusicTrackResponse, UploadedMusicFile } from './music.types.js';

const mapMusicTrackToResponse = (track: MusicTrackEntity): MusicTrackResponse => ({
  id: track.id,
  title: track.title,
  artist: track.artist,
  sanitizedName: track.sanitizedName,
  mimeType: track.mimeType,
  extension: track.extension,
  sizeBytes: track.sizeBytes,
  duration: track.duration,
  url: track.url,
  isActive: track.isActive,
  isDefault: track.isDefault,
  createdAt: track.createdAt.toISOString(),
  updatedAt: track.updatedAt.toISOString(),
});

const mapMulterFile = (file: Express.Multer.File): UploadedMusicFile => {
  const extension = getFileExtension(file.originalname);
  assertMusicFileType(file.mimetype, extension);
  assertMusicFileSize(file.size);

  return musicUploadFileSchema.parse({
    originalFilename: path.basename(file.originalname),
    sanitizedName: sanitizeFilename(file.originalname),
    extension,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    path: file.path,
  });
};

export const uploadMusicTrack = async (
  file: Express.Multer.File | null,
  input: unknown,
  user?: NeonAuthUser
) => {
  assertAdminUser(user, 'Only admins can upload music tracks.');

  if (!file) {
    throw new AppError('A music file is required.', 400);
  }

  const uploadedFile = mapMulterFile(file);
  let uploadedDropboxPath: string | null = null;

  try {
    const metadata = await probeAudio(uploadedFile.path);
    const parsedInput = createMusicTrackSchema.parse(input);
    const dropboxPath = buildDropboxPath('music', `${randomUUID()}.${uploadedFile.extension}`);
    const asset = await uploadFileToDropbox(uploadedFile.path, dropboxPath);
    uploadedDropboxPath = asset.path;

    const track = await createMusicTrack({
      file: uploadedFile,
      title: parsedInput.title?.trim() || uploadedFile.sanitizedName,
      artist: parsedInput.artist?.trim() || null,
      duration: metadata.duration ?? null,
      dropboxPath: asset.path,
      url: asset.url,
      sizeBytes: asset.sizeBytes,
      isActive: parsedInput.isActive ?? true,
      isDefault: parsedInput.isDefault ?? false,
      uploadedByUserId: user?.id,
    });

    return mapMusicTrackToResponse(track);
  } catch (error) {
    if (uploadedDropboxPath) {
      await deleteFilesFromDropbox([uploadedDropboxPath]);
    }

    throw error;
  } finally {
    await cleanupPath(path.dirname(uploadedFile.path));
  }
};

export const getPublicMusicTracks = async () => {
  const tracks = await findPublicMusicTracks();
  return tracks.map(mapMusicTrackToResponse);
};

export const getAdminMusicTracks = async (user?: NeonAuthUser) => {
  assertAdminUser(user, 'Only admins can view all music tracks.');
  const tracks = await findAllMusicTracks();
  return tracks.map(mapMusicTrackToResponse);
};

export const updateMusicTrack = async (
  id: string,
  input: unknown,
  user?: NeonAuthUser
) => {
  assertAdminUser(user, 'Only admins can update music tracks.');

  const existingTrack = await findMusicTrackById(id);

  if (!existingTrack) {
    throw new AppError('Music track was not found.', 404);
  }

  const parsedInput = updateMusicTrackSchema.parse(input);
  const updateData: Prisma.MusicTrackUpdateInput = {};

  if (parsedInput.title !== undefined) {
    updateData.title = parsedInput.title.trim();
  }

  if (parsedInput.artist !== undefined) {
    updateData.artist = parsedInput.artist?.trim() || null;
  }

  if (parsedInput.sanitizedName !== undefined) {
    updateData.sanitizedName = parsedInput.sanitizedName;
  }

  if (parsedInput.isActive !== undefined) {
    updateData.isActive = parsedInput.isActive;
  }

  if (parsedInput.isDefault !== undefined) {
    updateData.isDefault = parsedInput.isDefault;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('At least one editable music field is required.', 400);
  }

  const updatedTrack = await updateMusicTrackById(id, updateData);
  return mapMusicTrackToResponse(updatedTrack);
};

export const deleteMusicTrack = async (id: string, user?: NeonAuthUser) => {
  assertAdminUser(user, 'Only admins can delete music tracks.');

  const track = await findMusicTrackById(id);

  if (!track) {
    throw new AppError('Music track was not found.', 404);
  }

  await deleteFilesFromDropbox([track.dropboxPath]);
  await deleteMusicTrackById(id);
};
