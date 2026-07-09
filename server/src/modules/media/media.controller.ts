import type { Request, Response } from 'express';
import AppError from '../../common/errors/AppError.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { getUploadedFiles } from './media.upload.middleware.js';
import * as mediaService from './media.service.js';

const getRouteId = (id: string | string[] | undefined) => {
  if (typeof id !== 'string') {
    throw new AppError('A valid media id is required.', 400);
  }

  return id;
};

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  const files = getUploadedFiles(req);

  if (files.length === 0) {
    throw new AppError('At least one media file is required.', 400);
  }

  const uploadedFiles = await mediaService.uploadMedia(files, req.user?.id);

  res.status(201).json({
    success: true,
    files: uploadedFiles,
  });
});

export const getAllMedia = asyncHandler(async (req: Request, res: Response) => {
  const shouldPaginate =
    typeof req.query.page !== 'undefined' ||
    typeof req.query.pageSize !== 'undefined' ||
    typeof req.query.type !== 'undefined';

  if (shouldPaginate) {
    const media = await mediaService.getPaginatedMedia(req.query);

    res.status(200).json({
      success: true,
      ...media,
    });

    return;
  }

  const files = await mediaService.getMedia();

  res.status(200).json({
    success: true,
    files,
  });
});

export const getMediaById = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.getMediaById(getRouteId(req.params.id));

  res.status(200).json({
    success: true,
    file: media,
  });
});

export const updateMedia = asyncHandler(async (req: Request, res: Response) => {
  const media = await mediaService.updateMediaMetadata(getRouteId(req.params.id), req.body, req.user);

  res.status(200).json({
    success: true,
    file: media,
  });
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.deleteMedia(getRouteId(req.params.id));

  res.status(204).send();
});
