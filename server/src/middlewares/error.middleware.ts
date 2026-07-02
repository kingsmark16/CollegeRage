import type { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import AppError from '../common/errors/AppError.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      issues: error.issues,
    });
    return;
  }

  const appError =
    error instanceof AppError ? error : new AppError('Internal server error.', 500, false);

  if (appError.statusCode >= 500) {
    logger.error(appError.message, {
      error,
      stack: error instanceof Error ? error.stack : appError.stack,
    });
  }

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    ...(env.NODE_ENV === 'development' ? { stack: appError.stack } : {}),
  });
};
