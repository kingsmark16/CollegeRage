import { prisma } from '../../config/db.js';
import { MediaType } from '../../generated/prisma/index.js';

const numberOrZero = (value: number | null | undefined) => value ?? 0;

export const getStoredMediaStorageMetrics = async () => {
  const [
    imageCount,
    videoCount,
    imageStorage,
    videoVariantStorage,
    videoThumbnailStorage,
    musicCount,
    musicStorage,
  ] = await Promise.all([
    prisma.media.count({ where: { type: MediaType.IMAGE } }),
    prisma.media.count({ where: { type: MediaType.VIDEO } }),
    prisma.media.aggregate({
      where: { type: MediaType.IMAGE },
      _sum: { sizeBytes: true },
    }),
    prisma.videoVariant.aggregate({
      _sum: { sizeBytes: true },
    }),
    prisma.thumbnail.aggregate({
      _sum: { sizeBytes: true },
    }),
    prisma.musicTrack.count(),
    prisma.musicTrack.aggregate({
      _sum: { sizeBytes: true },
    }),
  ]);

  const imageSizeBytes = numberOrZero(imageStorage._sum.sizeBytes);
  const videoSizeBytes =
    numberOrZero(videoVariantStorage._sum.sizeBytes) + numberOrZero(videoThumbnailStorage._sum.sizeBytes);
  const musicSizeBytes = numberOrZero(musicStorage._sum.sizeBytes);

  return {
    imageCount,
    imageSizeBytes,
    videoCount,
    videoSizeBytes,
    musicCount,
    musicSizeBytes,
  };
};
