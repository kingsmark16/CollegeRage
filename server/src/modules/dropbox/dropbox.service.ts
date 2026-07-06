import crypto from 'node:crypto';
import { DropboxAuth, type DropboxAuthOptions } from 'dropbox';
import AppError from '../../common/errors/AppError.js';
import { decryptSecret, encryptSecret } from '../../common/utils/crypto.js';
import env from '../../config/env.js';
import {
  createDropboxOAuthState,
  findDropboxOAuthState,
  findLatestDropboxCredential,
  markDropboxOAuthStateUsed,
  upsertDropboxCredential,
} from './dropbox.repository.js';
import type { DropboxTokenResponse, StoredDropboxCredential } from './dropbox.types.js';

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const DROPBOX_SCOPES = [
  'account_info.read',
  'files.content.write',
  'files.content.read',
  'sharing.write',
  'sharing.read',
] as const;

const getConfiguredDropboxAuth = () => {
  if (!env.DROPBOX_CLIENT_ID) {
    throw new AppError('Dropbox client id is not configured.', 500);
  }

  if (!env.DROPBOX_REDIRECT_URI) {
    throw new AppError('Dropbox redirect URI is not configured.', 500);
  }

  const authOptions: DropboxAuthOptions = {
    clientId: env.DROPBOX_CLIENT_ID,
  };

  if (env.DROPBOX_CLIENT_SECRET) {
    authOptions.clientSecret = env.DROPBOX_CLIENT_SECRET;
  }

  const auth = new DropboxAuth(authOptions);

  return auth;
};

export const createDropboxAuthorizationUrl = async (userId: string) => {
  const state = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS);
  const auth = getConfiguredDropboxAuth();

  await createDropboxOAuthState(state, userId, expiresAt);

  const authorizationUrl = await auth.getAuthenticationUrl(
    env.DROPBOX_REDIRECT_URI!,
    state,
    'code',
    'offline',
    [...DROPBOX_SCOPES],
    'none',
    false
  );

  return {
    authorizationUrl: authorizationUrl.toString(),
    expiresAt,
  };
};

export const completeDropboxAuthorization = async (code: string, state: string) => {
  const oauthState = await findDropboxOAuthState(state);

  if (!oauthState || oauthState.usedAt || oauthState.expiresAt < new Date()) {
    throw new AppError('Dropbox OAuth state is invalid or expired.', 400);
  }

  const auth = getConfiguredDropboxAuth();
  const response = await auth.getAccessTokenFromCode(env.DROPBOX_REDIRECT_URI!, code);
  const tokenResponse = response.result as DropboxTokenResponse;

  if (!tokenResponse.access_token) {
    throw new AppError('Dropbox did not return an access token.', 502);
  }

  const expiresAt = tokenResponse.expires_in
    ? new Date(Date.now() + tokenResponse.expires_in * 1000)
    : null;

  await upsertDropboxCredential({
    accountId: tokenResponse.account_id ?? tokenResponse.uid ?? null,
    accessToken: encryptSecret(tokenResponse.access_token),
    refreshToken: tokenResponse.refresh_token ? encryptSecret(tokenResponse.refresh_token) : null,
    tokenType: tokenResponse.token_type ?? null,
    scope: tokenResponse.scope ?? null,
    expiresAt,
    connectedByUserId: oauthState.userId,
  });
  await markDropboxOAuthStateUsed(state);

  return {
    connected: true,
    accountId: tokenResponse.account_id ?? tokenResponse.uid ?? null,
    expiresAt,
    scope: tokenResponse.scope ?? null,
  };
};

export const getStoredDropboxCredential = async (): Promise<StoredDropboxCredential | null> => {
  const credential = await findLatestDropboxCredential();

  if (!credential) {
    return null;
  }

  return {
    accessToken: decryptSecret(credential.accessToken),
    ...(credential.refreshToken ? { refreshToken: decryptSecret(credential.refreshToken) } : {}),
    ...(credential.tokenType ? { tokenType: credential.tokenType } : {}),
    ...(credential.expiresAt ? { expiresAt: credential.expiresAt } : {}),
  };
};
