export type MediaVariantMap = Partial<Record<'480p' | '720p' | '1080p', string>>;

export type MediaItem = {
  id: string;
  type: 'image' | 'video';
  sanitizedName: string;
  description: string | null;
  thumbnail?: string;
  url?: string;
  variants?: MediaVariantMap;
};

export type UpdateMediaInput = Partial<{
  sanitizedName: string;
  description: string | null;
}>;
