import { z } from 'zod';
import { MUSIC_EXTENSIONS, MUSIC_MAX_BYTES, MUSIC_MIME_TYPES } from './music.constants.js';

const musicExtensionSchema = z.enum(MUSIC_EXTENSIONS);
const musicMimeTypeSchema = z.enum(MUSIC_MIME_TYPES);

export const musicUploadFileSchema = z.object({
  originalFilename: z.string().min(1).max(255),
  sanitizedName: z.string().min(1).max(180),
  extension: musicExtensionSchema,
  mimeType: musicMimeTypeSchema,
  sizeBytes: z.number().int().positive().max(MUSIC_MAX_BYTES),
  path: z.string().min(1),
});

export const createMusicTrackSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(180).optional(),
  artist: z.string().trim().max(180).nullable().optional(),
  isActive: z.coerce.boolean().optional(),
  isDefault: z.coerce.boolean().optional(),
});

export const updateMusicTrackSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  artist: z.string().trim().max(180).nullable().optional(),
  sanitizedName: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Sanitized name can only contain letters, numbers, dots, underscores, and hyphens.')
    .refine((value) => value !== '.' && value !== '..', 'Sanitized name is invalid.')
    .optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type MusicUploadFileInput = z.infer<typeof musicUploadFileSchema>;
export type CreateMusicTrackInput = z.infer<typeof createMusicTrackSchema>;
export type UpdateMusicTrackInput = z.infer<typeof updateMusicTrackSchema>;
