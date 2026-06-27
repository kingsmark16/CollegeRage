import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { NextFunction, Request, Response } from 'express';
import AppError from '../common/errors/AppError.js';
import env from '../config/env.js';
import { mapNeonAuthPayloadToUser } from '../modules/auth/auth.service.js';

const getJwks = () => {
  if (!env.NEON_AUTH_BASE_URL) {
    throw new AppError('Neon Auth is not configured.', 500);
  }

  return createRemoteJWKSet(new URL(`${env.NEON_AUTH_BASE_URL}/.well-known/jwks.json`));
};

const getIssuer = () => {
  if (!env.NEON_AUTH_BASE_URL) {
    throw new AppError('Neon Auth is not configured.', 500);
  }

  return new URL(env.NEON_AUTH_BASE_URL).origin;
};

const extractBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new AppError('Authentication token is required.', 401);
    }

    const { payload } = await jwtVerify(token, getJwks(), {
      issuer: getIssuer(),
      audience: getIssuer(),
    });

    const user = mapNeonAuthPayloadToUser(payload);

    if (!user.id) {
      throw new AppError('Authentication token is missing a subject.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError('Invalid or expired authentication token.', 401));
  }
};
