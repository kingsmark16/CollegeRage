import { prisma } from '../../config/db.js';

export const createDropboxOAuthState = async (state: string, userId: string, expiresAt: Date) =>
  prisma.dropboxOAuthState.create({
    data: {
      state,
      userId,
      expiresAt,
    },
  });

export const findDropboxOAuthState = async (state: string) =>
  prisma.dropboxOAuthState.findUnique({
    where: { state },
  });

export const markDropboxOAuthStateUsed = async (state: string) =>
  prisma.dropboxOAuthState.update({
    where: { state },
    data: { usedAt: new Date() },
  });

export const upsertDropboxCredential = async (input: {
  accountId: string | null;
  accessToken: string;
  refreshToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  expiresAt?: Date | null;
  connectedByUserId: string;
}) =>
  prisma.dropboxCredential.upsert({
    where: {
      accountId: input.accountId ?? 'default',
    },
    create: {
      accountId: input.accountId ?? 'default',
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenType: input.tokenType ?? null,
      scope: input.scope ?? null,
      expiresAt: input.expiresAt ?? null,
      connectedByUserId: input.connectedByUserId,
    },
    update: {
      accessToken: input.accessToken,
      refreshToken: input.refreshToken ?? null,
      tokenType: input.tokenType ?? null,
      scope: input.scope ?? null,
      expiresAt: input.expiresAt ?? null,
      connectedByUserId: input.connectedByUserId,
    },
  });

export const findLatestDropboxCredential = async () =>
  prisma.dropboxCredential.findFirst({
    orderBy: { updatedAt: 'desc' },
  });
