export type MusicTrack = {
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

export type UploadMusicTrackInput = {
  file: File;
  title?: string;
  artist?: string;
  isActive: boolean;
  isDefault: boolean;
};

export type UpdateMusicTrackInput = Partial<{
  title: string;
  artist: string | null;
  sanitizedName: string;
  isActive: boolean;
  isDefault: boolean;
}>;
