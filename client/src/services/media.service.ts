import { apiClient, getApiErrorMessage } from './api.service';
import { getAuthToken } from './auth.service';
import type { MediaItem, UpdateMediaInput } from '@/features/media/media.types';

type MediaListResponse = {
  success: true;
  files: MediaItem[];
};

type MediaDetailResponse = {
  success: true;
  file: MediaItem;
};

const getAuthorizedHeaders = async () => {
  const token = await getAuthToken();

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAdminMedia = async () => {
  try {
    const response = await apiClient.get<MediaListResponse>('/media');
    return response.data.files;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to load media library.'), { cause: error });
  }
};

export const getPublicMedia = getAdminMedia;

export const uploadMediaFiles = async (files: File[]) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await apiClient.post<MediaListResponse>('/media', formData, {
      headers: {
        ...(await getAuthorizedHeaders()),
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.files;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to upload media.'), { cause: error });
  }
};

export const updateMedia = async (id: string, input: UpdateMediaInput) => {
  try {
    const response = await apiClient.put<MediaDetailResponse>(`/media/${id}`, input, {
      headers: await getAuthorizedHeaders(),
    });

    return response.data.file;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to update media.'), { cause: error });
  }
};

export const deleteMedia = async (id: string) => {
  try {
    await apiClient.delete(`/media/${id}`, {
      headers: await getAuthorizedHeaders(),
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Unable to delete media.'), { cause: error });
  }
};
