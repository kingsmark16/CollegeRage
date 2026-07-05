import { prisma } from '../../config/db.js';
import type { Prisma } from '../../generated/prisma/index.js';
import type { CreateMusicTrackData, MusicTrackEntity } from './music.types.js';

const orderBy = [
  { createdAt: 'desc' as const },
];

export const createMusicTrack = async (input: CreateMusicTrackData): Promise<MusicTrackEntity> =>
  prisma.$transaction(async (transaction) => {
    if (input.isDefault) {
      await transaction.musicTrack.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return transaction.musicTrack.create({
      data: {
        title: input.title,
        artist: input.artist ?? null,
        originalFilename: input.file.originalFilename,
        sanitizedName: input.file.sanitizedName,
        mimeType: input.file.mimeType,
        extension: input.file.extension,
        sizeBytes: input.sizeBytes,
        duration: input.duration ?? null,
        dropboxPath: input.dropboxPath,
        url: input.url,
        isActive: input.isActive,
        isDefault: input.isDefault,
        uploadedByUserId: input.uploadedByUserId ?? null,
      },
    });
  });

export const findPublicMusicTracks = async (): Promise<MusicTrackEntity[]> =>
  prisma.musicTrack.findMany({
    where: { isActive: true },
    orderBy,
  });

export const findAllMusicTracks = async (): Promise<MusicTrackEntity[]> =>
  prisma.musicTrack.findMany({
    orderBy,
  });

export const findMusicTrackById = async (id: string): Promise<MusicTrackEntity | null> =>
  prisma.musicTrack.findUnique({
    where: { id },
  });

export const updateMusicTrackById = async (
  id: string,
  data: Prisma.MusicTrackUpdateInput
): Promise<MusicTrackEntity> =>
  prisma.$transaction(async (transaction) => {
    if (data.isDefault) {
      await transaction.musicTrack.updateMany({
        where: {
          isDefault: true,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return transaction.musicTrack.update({
      where: { id },
      data,
    });
  });

export const deleteMusicTrackById = async (id: string): Promise<MusicTrackEntity> =>
  prisma.musicTrack.delete({
    where: { id },
  });
