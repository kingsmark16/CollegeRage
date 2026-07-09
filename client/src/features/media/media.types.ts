export type MediaVariantMap = Partial<Record<'480p' | '720p' | '1080p', string>>;
export type MediaFilter = 'all' | 'image' | 'video';

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

export type PaginatedMediaList = {
  items: MediaItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
