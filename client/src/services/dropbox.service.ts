import { getAuthToken } from './auth.service';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

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
  const response = await fetch(`${apiBaseUrl}/dropbox/start`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json()) as DropboxStartResponse | ApiFailure;

  if (!response.ok || !payload.success) {
    throw new Error(payload.success ? 'Unable to start Dropbox authorization.' : payload.message);
  }

  return payload.authorizationUrl;
};
