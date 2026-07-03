import type { Response } from 'express';
import env from '../../config/env.js';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const parseCookies = (cookieHeader?: string) => {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const cookiePair of cookieHeader.split(';')) {
    const separatorIndex = cookiePair.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookiePair.slice(0, separatorIndex).trim();
    const value = cookiePair.slice(separatorIndex + 1).trim();

    if (!name) {
      continue;
    }

    try {
      cookies.set(name, decodeURIComponent(value));
    } catch {
      cookies.set(name, value);
    }
  }

  return cookies;
};

export const setHttpOnlyCookie = (
  res: Response,
  name: string,
  value: string,
  maxAgeSeconds = ONE_YEAR_SECONDS
) => {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (env.NODE_ENV === 'production') {
    attributes.push('Secure');
  }

  res.append('Set-Cookie', attributes.join('; '));
};
