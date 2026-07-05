import { apiClient, getApiErrorMessage } from './api.service';
import { getAuthToken } from './auth.service';
import type { MusicTrack, UpdateMusicTrackInput, UploadMusicTrackInput } from '@/features/music/music.types';

type TracksResponse = {
  success: true;
  tracks: MusicTrack[];
};

type TrackResponse = {
  success: true;
  track: MusicTrack;
};

const getAuthorizedHeaders = async () => {
  const token = await getAuthToken();

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getPublicMusicTracks = async () => {
  try {
    const response = await apiClient.get<TracksResponse>('/music');
    return response.data.tracks;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load music tracks.'), { cause: error });
  }
};

export const getAdminMusicTracks = async () => {
  try {
    const response = await apiClient.get<TracksResponse>('/music/admin', {
      headers: await getAuthorizedHeaders(),
    });

    return response.data.tracks;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load admin music tracks.'), { cause: error });
  }
};

export const uploadMusicTrack = async (input: UploadMusicTrackInput) => {
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('isActive', String(input.isActive));
  formData.append('isDefault', String(input.isDefault));

  if (input.title?.trim()) {
    formData.append('title', input.title.trim());
  }

  if (input.artist?.trim()) {
    formData.append('artist', input.artist.trim());
  }

  try {
    const response = await apiClient.post<TrackResponse>('/music/admin', formData, {
      headers: {
        ...(await getAuthorizedHeaders()),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.track;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to upload music track.'), { cause: error });
  }
};

export const updateMusicTrack = async (id: string, input: UpdateMusicTrackInput) => {
  try {
    const response = await apiClient.put<TrackResponse>(`/music/admin/${id}`, input, {
      headers: await getAuthorizedHeaders(),
    });

    return response.data.track;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update music track.'), { cause: error });
  }
};

export const deleteMusicTrack = async (id: string) => {
  try {
    await apiClient.delete(`/music/admin/${id}`, {
      headers: await getAuthorizedHeaders(),
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to delete music track.'), { cause: error });
  }
};
