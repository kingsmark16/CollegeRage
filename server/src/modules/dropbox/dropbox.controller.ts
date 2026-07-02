import type { Request, Response } from 'express';
import AppError from '../../common/errors/AppError.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { dropboxCallbackQuerySchema } from './dropbox.schema.js';
import { completeDropboxAuthorization, createDropboxAuthorizationUrl } from './dropbox.service.js';

export const startDropboxAuthorization = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('Authenticated user was not found on the request.', 401);
  }

  const authorization = await createDropboxAuthorizationUrl(req.user.id);

  res.status(200).json({
    success: true,
    authorizationUrl: authorization.authorizationUrl,
    expiresAt: authorization.expiresAt,
  });
});

export const handleDropboxCallback = asyncHandler(async (req: Request, res: Response) => {
  const query = dropboxCallbackQuerySchema.parse(req.query);
  const result = await completeDropboxAuthorization(query.code, query.state);

  res.status(200).json({
    success: true,
    dropbox: result,
  });
});
