import { useQuery } from '@tanstack/react-query';
import { getPublicMedia } from '@/services/media.service';

export const publicMediaGalleryQueryKey = ['media', 'public-gallery'] as const;

export const usePublicMediaGallery = () =>
  useQuery({
    queryKey: publicMediaGalleryQueryKey,
    queryFn: getPublicMedia,
  });
