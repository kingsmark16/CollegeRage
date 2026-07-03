import type { Request, Response } from 'express';
import AppError from '../../common/errors/AppError.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { getUploadedMusicFile } from './music.upload.middleware.js';
import * as musicService from './music.service.js';

const getRouteId = (id: string | string[] | undefined) => {
  if (typeof id !== 'string') {
    throw new AppError('A valid music track id is required.', 400);
  }

  return id;
};

export const uploadMusicTrack = asyncHandler(async (req: Request, res: Response) => {
  const track = await musicService.uploadMusicTrack(getUploadedMusicFile(req), req.body, req.user);

  res.status(201).json({
    success: true,
    track,
  });
});

export const getPublicMusicTracks = asyncHandler(async (_req: Request, res: Response) => {
  const tracks = await musicService.getPublicMusicTracks();

  res.status(200).json({
    success: true,
    tracks,
  });
});

export const getAdminMusicTracks = asyncHandler(async (req: Request, res: Response) => {
  const tracks = await musicService.getAdminMusicTracks(req.user);

  res.status(200).json({
    success: true,
    tracks,
  });
});

export const updateMusicTrack = asyncHandler(async (req: Request, res: Response) => {
  const track = await musicService.updateMusicTrack(getRouteId(req.params.id), req.body, req.user);

  res.status(200).json({
    success: true,
    track,
  });
});

export const deleteMusicTrack = asyncHandler(async (req: Request, res: Response) => {
  await musicService.deleteMusicTrack(getRouteId(req.params.id), req.user);

  res.status(204).send();
});
