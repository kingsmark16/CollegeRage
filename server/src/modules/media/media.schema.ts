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

export const updateMediaMetadataSchema = z.object({
  description: z
    .string()
    .trim()
    .max(1000, 'Description must be 1000 characters or less.')
    .nullable()
    .optional(),
  sanitizedName: z
    .string()
    .trim()
    .min(1, 'Sanitized name is required.')
    .max(180, 'Sanitized name must be 180 characters or less.')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Sanitized name can only contain letters, numbers, dots, underscores, and hyphens.')
    .refine((value) => value !== '.' && value !== '..', 'Sanitized name is invalid.')
    .optional(),
});

export const mediaListFilterSchema = z.enum(['all', 'image', 'video']);

export const mediaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(15),
  type: mediaListFilterSchema.default('all'),
});

export type ValidatedUploadFile = z.infer<typeof uploadFileValidationSchema>;
export type UpdateMediaMetadataInput = z.infer<typeof updateMediaMetadataSchema>;
export type MediaListQueryInput = z.infer<typeof mediaListQuerySchema>;
