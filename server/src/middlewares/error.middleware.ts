import type { ErrorRequestHandler } from 'express';
import AppError from '../common/errors/AppError.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const appError =
    error instanceof AppError ? error : new AppError('Internal server error.', 500, false);

  if (appError.statusCode >= 500) {
    logger.error(appError.message, { stack: appError.stack });
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    ...(env.NODE_ENV === 'development' ? { stack: appError.stack } : {}),
  });
};
