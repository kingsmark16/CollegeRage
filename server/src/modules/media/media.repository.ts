import { MediaType } from '../../generated/prisma/index.js';
import { prisma } from '../../config/db.js';
import type { CreateImageMediaInput, CreateVideoMediaInput, MediaWithRelations } from './media.types.js';

const mediaInclude = {
  image: true,
  video: {
    include: {
      thumbnail: true,
      variants: true,
    },
  },
} as const;

export const createImageMedia = async (input: CreateImageMediaInput): Promise<MediaWithRelations> =>
  prisma.media.create({
    data: {
      type: MediaType.IMAGE,
      originalFilename: input.file.originalFilename,
      sanitizedName: input.file.sanitizedName,
      mimeType: input.file.mimeType,
      extension: input.file.extension,
      sizeBytes: input.file.sizeBytes,
      width: input.metadata.width ?? null,
      height: input.metadata.height ?? null,
      uploadedByUserId: input.uploadedByUserId ?? null,
      image: {
        create: {
          dropboxPath: input.asset.path,
          url: input.asset.url,
        },
      },
    },
    include: mediaInclude,
  });

export const createVideoMedia = async (input: CreateVideoMediaInput): Promise<MediaWithRelations> =>
  prisma.media.create({
    data: {
      type: MediaType.VIDEO,
      originalFilename: input.file.originalFilename,
      sanitizedName: input.file.sanitizedName,
      mimeType: input.file.mimeType,
      extension: input.file.extension,
      sizeBytes: input.file.sizeBytes,
      width: input.processedVideo.metadata.width ?? null,
      height: input.processedVideo.metadata.height ?? null,
      uploadedByUserId: input.uploadedByUserId ?? null,
      video: {
        create: {
          duration: input.processedVideo.metadata.duration ?? null,
          thumbnail: {
            create: {
              width: input.processedVideo.thumbnail.width ?? null,
              height: input.processedVideo.thumbnail.height ?? null,
              sizeBytes: input.processedVideo.thumbnail.sizeBytes,
              dropboxPath: input.processedVideo.thumbnail.path,
              url: input.processedVideo.thumbnail.url,
            },
          },
          variants: {
            create: input.processedVideo.variants.map((variant) => ({
              quality: variant.quality,
              width: variant.width,
              height: variant.height,
              sizeBytes: variant.sizeBytes,
              dropboxPath: variant.path,
              url: variant.url,
            })),
          },
        },
      },
    },
    include: mediaInclude,
  });

export const findMediaById = async (id: string): Promise<MediaWithRelations | null> =>
  prisma.media.findUnique({
    where: { id },
    include: mediaInclude,
  });

export const findAllMedia = async (): Promise<MediaWithRelations[]> =>
  prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    include: mediaInclude,
  });

export const deleteMediaById = async (id: string) =>
  prisma.media.delete({
    where: { id },
  });

export const updateMediaMetadataById = async (
  id: string,
  data: {
    description?: string | null;
    sanitizedName?: string;
  }
): Promise<MediaWithRelations> =>
  prisma.media.update({
    where: { id },
    data,
    include: mediaInclude,
  });
