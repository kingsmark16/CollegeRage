import crypto from 'node:crypto';
import AppError from '../errors/AppError.js';
import env from '../../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

const getEncryptionKey = () => {
  const secret = env.DROPBOX_TOKEN_ENCRYPTION_KEY || env.DROPBOX_CLIENT_SECRET;

  if (!secret) {
    throw new AppError('Dropbox token encryption key is not configured.', 500);
  }

  return crypto.scryptSync(secret, 'college-rage-dropbox-token', KEY_LENGTH);
};

export const encryptSecret = (value: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
};

export const decryptSecret = (value: string) => {
  const [iv, authTag, encrypted] = value.split('.');

  if (!iv || !authTag || !encrypted) {
    throw new AppError('Encrypted secret is invalid.', 500);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));

  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]).toString('utf8');
};
