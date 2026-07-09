import type { Media, VideoVariantQuality } from '../../generated/prisma/index.js';

export type MediaKind = 'image' | 'video';
export type VideoVariantLabel = '480p' | '720p' | '1080p';
export type MediaListFilter = 'all' | 'image' | 'video';

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
  sanitizedName: string;
  description: string | null;
  thumbnail?: string;
  url?: string;
  variants?: Record<VideoVariantLabel, string>;
};

export type MediaListQuery = {
  page: number;
  pageSize: number;
  type: MediaListFilter;
};

export type PaginatedMediaList = {
  items: MediaUploadResponseItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type MediaWithRelations = Media & {
  image?: {
    dropboxPath: string;
    url: string;
  } | null;
  video?: {
    thumbnail?: {
      dropboxPath: string;
      url: string;
    } | null;
    variants: Array<{
      dropboxPath: string;
      quality: VideoVariantQuality;
      url: string;
    }>;
  } | null;
};
