import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { refreshSession } from '@/features/auth/api/refreshSession';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';

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

/** AuthProvider registers this so failed refresh clears session */
export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_SKIP_REFRESH = new Set<string>([
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.REFRESH_TOKEN,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
  AUTH_ENDPOINTS.LOGOUT,
]);

/*
This function is used to determine if a refresh should be skipped.
examples we ignore refresh:
1- login/register/refresh-token => we don't want to refresh the session on these pages.
2- forgot-password/reset-password => we don't want to refresh the session on these pages.
3- logout => we don't want to refresh the session on this page.
*/
const shouldSkipRefresh = (url?: string): boolean => {
  if (!url) {
    return false;
  }
  for (const path of AUTH_SKIP_REFRESH) {
    if (url.includes(path)) {
      return true;
    }
  }
  return false;
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      console.error('Unexpected non-Axios error:', error);
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const original = error.config as RetryConfig | undefined;
// If the session is expired & we are not on a page that should skip refresh, we need to refresh it.
    if (status === 401 && original && !original._retry && !shouldSkipRefresh(original.url)) {
      original._retry = true;
      try {
        await refreshSession();
        return api(original);
      } catch {
        onUnauthorized?.();
        return Promise.reject(error);
      }
    }

    // If the session is expired & we are on a page that should skip refresh, we don't need to refresh it.
    if (status === 401 && shouldSkipRefresh(original?.url)) {
      // login/refresh failures: do not clear session on login page 401s unless refresh failed
      if (original?.url?.includes(AUTH_ENDPOINTS.REFRESH_TOKEN)) {
        onUnauthorized?.();
      }
      return Promise.reject(error);
    }

    if (error.response) {
      switch (status) {
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
          if (status !== 401) {
            console.error('API error:', status);
          }
      }
    } else if (error.request) {
      console.error('Network error: server did not respond.');
    }

    return Promise.reject(error);
  },
);

export default api;
