import path from 'node:path';
import { randomUUID } from 'node:crypto';
import AppError from '../../common/errors/AppError.js';
import { cleanupPath, safeJoin } from '../../common/utils/file.js';
import { buildDropboxPath, uploadFileToDropbox } from '../../services/dropbox.service.js';
import { processVideo } from '../../services/ffmpeg.service.js';
import {
  createImageMedia,
  createVideoMedia,
  deleteMediaById,
  findAllMedia,
  findMediaById,
} from './media.repository.js';
import { uploadRequestValidationSchema } from './media.schema.js';
import { getFileExtension, readImageMetadata, resolveMediaKind, sanitizeFilename, assertFileSize } from './media.validation.js';
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

const mapMediaToUploadResponse = (media: MediaWithRelations): MediaUploadResponseItem => {
  if (media.type === 'IMAGE') {
    return {
      id: media.id,
      type: 'image',
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
    thumbnail: media.video?.thumbnail?.url ?? '',
    variants: variants ?? ({} as Record<VideoVariantLabel, string>),
  };
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

  const uploadedVariants = [];

  for (const variant of processedVideo.outputFiles) {
    const dropboxPath = buildDropboxPath('videos', videoId, `${variant.label}.mp4`);
    const asset = await uploadFileToDropbox(variant.filePath, dropboxPath);
    uploadedVariants.push({
      ...variant,
      path: asset.path,
      url: asset.url,
      sizeBytes: asset.sizeBytes,
    });
  }

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

export const deleteMedia = async (id: string) => {
  const media = await findMediaById(id);

  if (!media) {
    throw new AppError('Media was not found.', 404);
  }

  await deleteMediaById(id);
};
