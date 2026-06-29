import type { Media, VideoVariantQuality } from '../../generated/prisma/index.js';

export type MediaKind = 'image' | 'video';
export type VideoVariantLabel = '480p' | '720p' | '1080p';

export type UploadedMediaFile = {
  mediaType: MediaKind;
  originalFilename: string;
  sanitizedName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
};

export type DropboxAsset = {
  path: string;
  url: string;
  sizeBytes: number;
};

export type ImageMetadata = {
  width?: number;
  height?: number;
};

export type VideoMetadata = {
  width?: number;
  height?: number;
  duration?: number;
};

export type ProcessedVideoVariant = DropboxAsset & {
  quality: VideoVariantQuality;
  label: VideoVariantLabel;
  width: number;
  height: number;
};

export type ProcessedThumbnail = DropboxAsset & {
  width?: number;
  height?: number;
};

export type ProcessedVideo = {
  metadata: VideoMetadata;
  variants: ProcessedVideoVariant[];
  thumbnail: ProcessedThumbnail;
};

export type CreateImageMediaInput = {
  file: UploadedMediaFile;
  asset: DropboxAsset;
  metadata: ImageMetadata;
  uploadedByUserId?: string | undefined;
};

export type CreateVideoMediaInput = {
  file: UploadedMediaFile;
  processedVideo: ProcessedVideo;
  uploadedByUserId?: string | undefined;
};

export type MediaUploadResponseItem = {
  id: string;
  type: MediaKind;
  thumbnail?: string;
  url?: string;
  variants?: Record<VideoVariantLabel, string>;
};

export type MediaWithRelations = Media & {
  image?: { url: string } | null;
  video?: {
    thumbnail?: { url: string } | null;
    variants: Array<{
      quality: VideoVariantQuality;
      url: string;
    }>;
  } | null;
};
