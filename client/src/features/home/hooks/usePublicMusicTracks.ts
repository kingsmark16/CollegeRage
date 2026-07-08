import { useQuery } from '@tanstack/react-query';
import { getPublicMusicTracks } from '@/services/music.service';

export const publicMusicTracksQueryKey = ['music', 'public'] as const;

export const usePublicMusicTracks = () =>
  useQuery({
    queryKey: publicMusicTracksQueryKey,
    queryFn: getPublicMusicTracks,
  });
