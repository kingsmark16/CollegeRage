import { apiClient } from './api.service';
import { getAuthToken } from './auth.service';

type DropboxStartResponse = {
  success: true;
  authorizationUrl: string;
  expiresAt: string;
};

type ApiFailure = {
  success: false;
  message: string;
};

export const startDropboxAuthorization = async () => {
  const token = await getAuthToken();
  const response = await apiClient.get<DropboxStartResponse | ApiFailure>('/dropbox/start', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = response.data;

  if (!payload.success) {
    throw new Error(payload.success ? 'Unable to start Dropbox authorization.' : payload.message);
  }

  return payload.authorizationUrl;
};
