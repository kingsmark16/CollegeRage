import type { MusicTrack } from '../../generated/prisma/index.js';
import type { MusicUploadFileInput } from './music.schema.js';

export type UploadedMusicFile = MusicUploadFileInput;

export type MusicTrackResponse = {
  id: string;
  title: string;
  artist: string | null;
  sanitizedName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  duration: number | null;
  url: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMusicTrackData = {
  file: UploadedMusicFile;
  title: string;
  artist?: string | null;
  duration?: number | null;
  dropboxPath: string;
  url: string;
  sizeBytes: number;
  isActive: boolean;
  isDefault: boolean;
  uploadedByUserId?: string | undefined;
};

export type MusicTrackEntity = MusicTrack;
