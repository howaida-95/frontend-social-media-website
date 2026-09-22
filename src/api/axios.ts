import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

/** AuthProvider registers this so 401 clears session without hard navigation loops */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      console.error('Unexpected non-Axios error:', error);
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          onUnauthorized?.();
          break;

        case 403:
          console.error('Forbidden: You do not have permission.');
          break;

        case 404:
          console.error('Resource not found.');
          break;

        case 500:
          console.error('Internal server error.');
          break;

        default:
          console.error('API error:', status);
      }
    } else if (error.request) {
      console.error('Network error: server did not respond.');
    }

    return Promise.reject(error);
  },
);

export default api;
