import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { getAuthToken, getOptionalAuthToken } from './auth.service';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  message: string;
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ApiFailure | undefined)?.message;
    return message || error.message || fallbackMessage;
  }

  return error instanceof Error ? error.message : fallbackMessage;
};

const buildAuthorizedConfig = async (init?: AxiosRequestConfig, optional = false): Promise<AxiosRequestConfig> => {
  const token = optional ? await getOptionalAuthToken() : await getAuthToken();

  return {
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

export const authenticatedRequest = async <T>(path: string, init?: AxiosRequestConfig) => {
  const config = await buildAuthorizedConfig(init);
  const response = await apiClient.request<ApiResponse<T>>({
    url: path,
    ...config,
  });
  const payload = response.data;

  if (!payload.success) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload.data;
};

export const optionalAuthenticatedRequest = async <T>(path: string, init?: AxiosRequestConfig) => {
  const config = await buildAuthorizedConfig(init, true);
  const response = await apiClient.request<T>({
    url: path,
    ...config,
  });

  return response.data;
};
