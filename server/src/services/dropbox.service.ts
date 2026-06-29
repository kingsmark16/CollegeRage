import { open } from 'node:fs/promises';
import { Dropbox, DropboxAuth, DropboxResponseError, type DropboxAuthOptions } from 'dropbox';
import AppError from '../common/errors/AppError.js';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { getFileSize } from '../common/utils/file.js';
import { getStoredDropboxCredential } from '../modules/dropbox/dropbox.service.js';

const SMALL_UPLOAD_LIMIT_BYTES = 140 * 1024 * 1024;
const CHUNK_SIZE_BYTES = 8 * 1024 * 1024;

type DropboxUploadResult = {
  path: string;
  url: string;
  sizeBytes: number;
};

const normalizeDropboxRoot = (root: string) => {
  const normalized = `/${root.replace(/^\/+|\/+$/g, '')}`;
  return normalized === '/' ? '' : normalized;
};

const getDropboxClient = async () => {
  const storedCredential = await getStoredDropboxCredential();

  if (!storedCredential) {
    throw new AppError('Dropbox upload credentials are not configured.', 500);
  }

  const authOptions: DropboxAuthOptions = {};

  const accessToken = storedCredential.accessToken;
  const refreshToken = storedCredential.refreshToken;
  const accessTokenExpiresAt = storedCredential.expiresAt;

  if (accessToken) {
    authOptions.accessToken = accessToken;
  }

  if (refreshToken) {
    authOptions.refreshToken = refreshToken;
  }

  if (accessTokenExpiresAt) {
    authOptions.accessTokenExpiresAt = accessTokenExpiresAt;
  }

  if (env.DROPBOX_CLIENT_ID) {
    authOptions.clientId = env.DROPBOX_CLIENT_ID;
  }

  if (env.DROPBOX_CLIENT_SECRET) {
    authOptions.clientSecret = env.DROPBOX_CLIENT_SECRET;
  }

  const auth = new DropboxAuth(authOptions);

  return new Dropbox({ auth });
};

const toDirectUrl = (url: string) => {
  const parsedUrl = new URL(url);
  parsedUrl.searchParams.set('raw', '1');
  parsedUrl.searchParams.delete('dl');
  return parsedUrl.toString();
};

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const withRetry = async <T>(operation: () => Promise<T>, label: string): Promise<T> => {
  const attempts = Math.max(1, env.DROPBOX_UPLOAD_RETRIES);
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      logger.warn('Dropbox operation failed.', { label, attempt, error });
      if (attempt < attempts) {
        await sleep(250 * attempt);
      }
    }
  }

  throw new AppError('Dropbox upload failed.', 502, true);
};

const createSharedUrl = async (client: Dropbox, dropboxPath: string) => {
  try {
    const response = await withRetry(
      () => client.sharingCreateSharedLinkWithSettings({ path: dropboxPath }),
      'sharingCreateSharedLinkWithSettings'
    );
    return toDirectUrl(response.result.url);
  } catch (error) {
    if (error instanceof DropboxResponseError) {
      const existingLinks = await withRetry(
        () => client.sharingListSharedLinks({ path: dropboxPath, direct_only: true }),
        'sharingListSharedLinks'
      );
      const existingLink = existingLinks.result.links[0];

      if (existingLink?.url) {
        return toDirectUrl(existingLink.url);
      }
    }

    throw error;
  }
};

const uploadSmallFile = async (client: Dropbox, localPath: string, dropboxPath: string) => {
  const fileHandle = await open(localPath, 'r');

  try {
    const contents = await fileHandle.readFile();
    await withRetry(
      () =>
        client.filesUpload({
          path: dropboxPath,
          mode: { '.tag': 'add' },
          autorename: false,
          mute: true,
          contents,
        }),
      'filesUpload'
    );
  } finally {
    await fileHandle.close();
  }
};

const uploadLargeFile = async (client: Dropbox, localPath: string, dropboxPath: string, sizeBytes: number) => {
  const fileHandle = await open(localPath, 'r');
  let offset = 0;

  try {
    const firstChunkSize = Math.min(CHUNK_SIZE_BYTES, sizeBytes);
    const firstChunk = Buffer.alloc(firstChunkSize);
    await fileHandle.read(firstChunk, 0, firstChunkSize, offset);
    const session = await withRetry(
      () => client.filesUploadSessionStart({ close: false, contents: firstChunk }),
      'filesUploadSessionStart'
    );
    offset += firstChunkSize;

    while (offset < sizeBytes) {
      const remainingBytes = sizeBytes - offset;
      const chunkSize = Math.min(CHUNK_SIZE_BYTES, remainingBytes);
      const chunk = Buffer.alloc(chunkSize);
      await fileHandle.read(chunk, 0, chunkSize, offset);

      if (offset + chunkSize >= sizeBytes) {
        await withRetry(
          () =>
            client.filesUploadSessionFinish({
              cursor: { session_id: session.result.session_id, offset },
              commit: {
                path: dropboxPath,
                mode: { '.tag': 'add' },
                autorename: false,
                mute: true,
              },
              contents: chunk,
            }),
          'filesUploadSessionFinish'
        );
      } else {
        await withRetry(
          () =>
            client.filesUploadSessionAppendV2({
              cursor: { session_id: session.result.session_id, offset },
              close: false,
              contents: chunk,
            }),
          'filesUploadSessionAppendV2'
        );
      }

      offset += chunkSize;
    }
  } finally {
    await fileHandle.close();
  }
};

export const buildDropboxPath = (...segments: string[]) => {
  const sanitizedSegments = segments.map((segment) => segment.replace(/^\/+|\/+$/g, '').replace(/\\/g, '/'));
  return `${normalizeDropboxRoot(env.DROPBOX_UPLOAD_ROOT)}/${sanitizedSegments.join('/')}`;
};

export const uploadFileToDropbox = async (localPath: string, dropboxPath: string): Promise<DropboxUploadResult> => {
  const client = await getDropboxClient();
  const sizeBytes = await getFileSize(localPath);

  if (sizeBytes <= SMALL_UPLOAD_LIMIT_BYTES) {
    await uploadSmallFile(client, localPath, dropboxPath);
  } else {
    await uploadLargeFile(client, localPath, dropboxPath, sizeBytes);
  }

  const url = await createSharedUrl(client, dropboxPath);
  return { path: dropboxPath, url, sizeBytes };
};
