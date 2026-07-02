import path from 'node:path';
import { randomUUID } from 'node:crypto';
import AppError from '../../common/errors/AppError.js';
import env from '../../config/env.js';
import { cleanupPath, safeJoin } from '../../common/utils/file.js';
import { buildDropboxPath, deleteFilesFromDropbox, uploadFileToDropbox } from '../../services/dropbox.service.js';
import { processVideo } from '../../services/ffmpeg.service.js';
import {
  createImageMedia,
  createVideoMedia,
  deleteMediaById,
  findAllMedia,
  findMediaById,
  updateMediaMetadataById,
} from './media.repository.js';
import { updateMediaMetadataSchema, uploadRequestValidationSchema } from './media.schema.js';
import { getFileExtension, readImageMetadata, resolveMediaKind, sanitizeFilename, assertFileSize } from './media.validation.js';
import type { NeonAuthUser } from '../auth/auth.types.js';
import type {
  MediaUploadResponseItem,
  MediaWithRelations,
  ProcessedVideo,
  UploadedMediaFile,
  VideoVariantLabel,
} from './media.types.js';

const qualityLabelMap = {
  P480: '480p',
  P720: '720p',
  P1080: '1080p',
} as const;

const mapWithConcurrency = async <TInput, TOutput>(
  inputs: TInput[],
  concurrency: number,
  mapper: (input: TInput, index: number) => Promise<TOutput>
) => {
  const results: TOutput[] = new Array(inputs.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= inputs.length) {
        return;
      }

      const input = inputs[currentIndex];

      if (input === undefined) {
        return;
      }

      results[currentIndex] = await mapper(input, currentIndex);
    }
  };

  const workerCount = Math.min(Math.max(1, concurrency), inputs.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
};

const mapMediaToUploadResponse = (media: MediaWithRelations): MediaUploadResponseItem => {
  if (media.type === 'IMAGE') {
    return {
      id: media.id,
      type: 'image',
      sanitizedName: media.sanitizedName,
      description: media.description,
      url: media.image?.url ?? '',
    };
  }

  const variants = media.video?.variants.reduce(
    (accumulator, variant) => ({
      ...accumulator,
      [qualityLabelMap[variant.quality]]: variant.url,
    }),
    {} as Record<VideoVariantLabel, string>
  );

  return {
    id: media.id,
    type: 'video',
    sanitizedName: media.sanitizedName,
    description: media.description,
    thumbnail: media.video?.thumbnail?.url ?? '',
    variants: variants ?? ({} as Record<VideoVariantLabel, string>),
  };
};

const assertAdminUser = (user?: NeonAuthUser) => {
  const adminEmails = new Set(
    env.ADMIN_EMAILS.split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
  const hasAdminRole =
    user?.role?.toLowerCase() === 'admin' ||
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ||
    Boolean(user?.email && adminEmails.has(user.email.toLowerCase()));

  if (!hasAdminRole) {
    throw new AppError('Only admins can update media metadata.', 403);
  }
};

const mapMulterFiles = (files: Express.Multer.File[]): UploadedMediaFile[] => {
  const mappedFiles = files.map((file) => {
    const extension = getFileExtension(file.originalname);
    const mediaType = resolveMediaKind(file.mimetype, extension);

    assertFileSize(mediaType, file.size);

    return {
      mediaType,
      originalFilename: path.basename(file.originalname),
      sanitizedName: sanitizeFilename(file.originalname),
      extension,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      path: file.path,
    };
  });

  return uploadRequestValidationSchema.parse({ files: mappedFiles }).files;
};

const getDropboxDeleteTargetsForMedia = (media: MediaWithRelations) => {
  if (media.type === 'IMAGE') {
    return media.image?.dropboxPath ? [media.image.dropboxPath] : [];
  }

  const firstVariantPath = media.video?.variants[0]?.dropboxPath;
  const thumbnailPath = media.video?.thumbnail?.dropboxPath;
  const videoFolderPath = firstVariantPath
    ? path.posix.dirname(firstVariantPath)
    : thumbnailPath
      ? path.posix.dirname(thumbnailPath)
      : null;

  return videoFolderPath ? [videoFolderPath] : [];
};

const uploadImage = async (file: UploadedMediaFile, uploadedByUserId?: string) => {
  const metadata = await readImageMetadata(file.path, file.mimeType);
  const dropboxPath = buildDropboxPath('images', `${randomUUID()}.${file.extension}`);
  const asset = await uploadFileToDropbox(file.path, dropboxPath);

  return createImageMedia({
    file,
    asset,
    metadata,
    uploadedByUserId,
  });
};

const uploadProcessedVideoAssets = async (
  file: UploadedMediaFile,
  uploadedByUserId?: string
): Promise<MediaWithRelations> => {
  const videoId = randomUUID();
  const outputDirectory = safeJoin(path.dirname(file.path), 'processed');
  const processedVideo = await processVideo(file.path, outputDirectory);
  const videoFolderPath = buildDropboxPath('videos', videoId);

  try {
    const uploadedVariants = await mapWithConcurrency(
      processedVideo.outputFiles,
      env.DROPBOX_UPLOAD_CONCURRENCY,
      async (variant) => {
        const dropboxPath = buildDropboxPath('videos', videoId, `${variant.label}.mp4`);
        const asset = await uploadFileToDropbox(variant.filePath, dropboxPath);

        return {
          ...variant,
          path: asset.path,
          url: asset.url,
          sizeBytes: asset.sizeBytes,
        };
      }
    );

    const thumbnailPath = buildDropboxPath('videos', videoId, 'thumbnail.jpg');
    const thumbnailAsset = await uploadFileToDropbox(processedVideo.thumbnailFile.filePath, thumbnailPath);
    const videoForDatabase: ProcessedVideo = {
      metadata: processedVideo.metadata,
      variants: uploadedVariants,
      thumbnail: {
        ...processedVideo.thumbnail,
        path: thumbnailAsset.path,
        url: thumbnailAsset.url,
        sizeBytes: thumbnailAsset.sizeBytes,
      },
    };

    return createVideoMedia({
      file,
      processedVideo: videoForDatabase,
      uploadedByUserId,
    });
  } catch (error) {
    await deleteFilesFromDropbox([videoFolderPath]);
    throw error;
  }
};

export const uploadMedia = async (files: Express.Multer.File[], uploadedByUserId?: string) => {
  const validatedFiles = mapMulterFiles(files);
  const uploadedMedia: MediaWithRelations[] = [];

  for (const file of validatedFiles) {
    try {
      const media = file.mediaType === 'image' ? await uploadImage(file, uploadedByUserId) : await uploadProcessedVideoAssets(file, uploadedByUserId);
      uploadedMedia.push(media);
    } finally {
      await cleanupPath(path.dirname(file.path));
    }
  }

  return uploadedMedia.map(mapMediaToUploadResponse);
};

export const getMedia = async () => {
  const media = await findAllMedia();
  return media.map(mapMediaToUploadResponse);
};

export const getMediaById = async (id: string) => {
  const media = await findMediaById(id);

  if (!media) {
    throw new AppError('Media was not found.', 404);
  }

  return mapMediaToUploadResponse(media);
};

export const updateMediaMetadata = async (
  id: string,
  input: unknown,
  user?: NeonAuthUser
) => {
  assertAdminUser(user);

  const media = await findMediaById(id);

  if (!media) {
    throw new AppError('Media was not found.', 404);
  }

  const parsedInput = updateMediaMetadataSchema.parse(input);
  const updateData: {
    description?: string | null;
    sanitizedName?: string;
  } = {};

  if ('description' in parsedInput) {
    updateData.description = parsedInput.description?.trim() || null;
  }

  if (parsedInput.sanitizedName) {
    updateData.sanitizedName = parsedInput.sanitizedName;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError('At least one editable media field is required.', 400);
  }

  const updatedMedia = await updateMediaMetadataById(id, updateData);

  return mapMediaToUploadResponse(updatedMedia);
};

export const deleteMedia = async (id: string) => {
  const media = await findMediaById(id);

  if (!media) {
    throw new AppError('Media was not found.', 404);
  }

  await deleteFilesFromDropbox(getDropboxDeleteTargetsForMedia(media));
  await deleteMediaById(id);
};
