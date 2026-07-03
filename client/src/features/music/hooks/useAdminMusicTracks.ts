import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMusicTrack,
  getAdminMusicTracks,
  updateMusicTrack,
  uploadMusicTrack,
} from '@/services/music.service';
import type { UpdateMusicTrackInput, UploadMusicTrackInput } from '../music.types';

export const adminMusicTracksQueryKey = ['music', 'admin'] as const;

export const useAdminMusicTracks = () => {
  const queryClient = useQueryClient();
  const tracksQuery = useQuery({
    queryKey: adminMusicTracksQueryKey,
    queryFn: getAdminMusicTracks,
  });

  const invalidateTracks = () => queryClient.invalidateQueries({ queryKey: adminMusicTracksQueryKey });

  const uploadMutation = useMutation({
    mutationFn: (input: UploadMusicTrackInput) => uploadMusicTrack(input),
    onSuccess: invalidateTracks,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMusicTrackInput }) => updateMusicTrack(id, input),
    onSuccess: invalidateTracks,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMusicTrack,
    onSuccess: invalidateTracks,
  });

  return {
    deleteMutation,
    tracksQuery,
    updateMutation,
    uploadMutation,
  };
};
