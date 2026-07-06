import AppError from '../../common/errors/AppError.js';
import { getDropboxSpaceUsage } from '../../services/dropbox.service.js';
import { getStoredMediaStorageMetrics } from './dashboard.repository.js';
import type { DashboardOverviewMetrics } from './dashboard.types.js';

export const getDashboardOverviewMetrics = async (): Promise<DashboardOverviewMetrics> => {
  const mediaMetrics = await getStoredMediaStorageMetrics();
  let dropbox: DashboardOverviewMetrics['dropbox'];

  try {
    const spaceUsage = await getDropboxSpaceUsage();
    dropbox = {
      connected: true,
      requiresReconnect: false,
      message: null,
      ...spaceUsage,
    };
  } catch (error) {
    if (error instanceof AppError && (error.statusCode === 500 || error.statusCode === 409)) {
      dropbox = {
        connected: error.statusCode === 409,
        requiresReconnect: error.statusCode === 409,
        message:
          error.statusCode === 409
            ? 'Reconnect Dropbox to grant storage usage permission.'
            : 'Connect Dropbox to show account storage usage.',
        usedBytes: null,
        allocatedBytes: null,
        usagePercent: null,
        allocationType: null,
      };
    } else {
      throw error;
    }
  }

  const breakdown = [
    {
      key: 'images' as const,
      label: 'Images',
      count: mediaMetrics.imageCount,
      sizeBytes: mediaMetrics.imageSizeBytes,
    },
    {
      key: 'videos' as const,
      label: 'Videos',
      count: mediaMetrics.videoCount,
      sizeBytes: mediaMetrics.videoSizeBytes,
    },
    {
      key: 'music' as const,
      label: 'Music',
      count: mediaMetrics.musicCount,
      sizeBytes: mediaMetrics.musicSizeBytes,
    },
  ];

  return {
    dropbox,
    media: {
      totalCount: mediaMetrics.imageCount + mediaMetrics.videoCount + mediaMetrics.musicCount,
      totalSizeBytes: mediaMetrics.imageSizeBytes + mediaMetrics.videoSizeBytes + mediaMetrics.musicSizeBytes,
      ...mediaMetrics,
      breakdown,
    },
  };
};
