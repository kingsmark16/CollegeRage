import { z } from 'zod';
import {
  IMAGE_EXTENSIONS,
  IMAGE_MAX_BYTES,
  IMAGE_MIME_TYPES,
  MAX_MEDIA_FILES,
  VIDEO_EXTENSIONS,
  VIDEO_MAX_BYTES,
  VIDEO_MIME_TYPES,
} from './media.constants.js';

const imageExtensionSchema = z.enum(IMAGE_EXTENSIONS);
const videoExtensionSchema = z.enum(VIDEO_EXTENSIONS);
const imageMimeTypeSchema = z.enum(IMAGE_MIME_TYPES);
const videoMimeTypeSchema = z.enum(VIDEO_MIME_TYPES);

export const uploadFileValidationSchema = z.discriminatedUnion('mediaType', [
  z.object({
    mediaType: z.literal('image'),
    originalFilename: z.string().min(1).max(255),
    sanitizedName: z.string().min(1).max(255),
    extension: imageExtensionSchema,
    mimeType: imageMimeTypeSchema,
    sizeBytes: z.number().int().positive().max(IMAGE_MAX_BYTES),
    path: z.string().min(1),
  }),
  z.object({
    mediaType: z.literal('video'),
    originalFilename: z.string().min(1).max(255),
    sanitizedName: z.string().min(1).max(255),
    extension: videoExtensionSchema,
    mimeType: videoMimeTypeSchema,
    sizeBytes: z.number().int().positive().max(VIDEO_MAX_BYTES),
    path: z.string().min(1),
  }),
]);

export const uploadRequestValidationSchema = z.object({
  files: z
    .array(uploadFileValidationSchema)
    .min(1, 'At least one media file is required.')
    .max(MAX_MEDIA_FILES, `A maximum of ${MAX_MEDIA_FILES} files can be uploaded.`),
});

export type ValidatedUploadFile = z.infer<typeof uploadFileValidationSchema>;
