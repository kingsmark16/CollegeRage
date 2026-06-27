import type { Request, Response } from 'express';
import AppError from '../../common/errors/AppError.js';
import { sendSuccess } from '../../common/utils/response.js';
import { getAuthenticatedUser } from './auth.service.js';

export const getMe = (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authenticated user was not found on the request.', 401);
  }

  sendSuccess(res, getAuthenticatedUser(req.user));
};
