import axios from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = "dummy data"; // Replace with your authentication logic

    if (token) {
      config.headers = {
        ...(config.headers as Record<string, unknown>),
        Authorization: `Bearer ${token}`,
      } as typeof config.headers;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor
/*
The interceptor should perform actual global HTTP behavior, 
then reject the error so the feature layer can handle the user-facing state.
*/
// intercept responses coming back from the server.
// use() registers two callbacks.
api.interceptors.response.use(
  /*
  There are two possible situations:
  Response
    │
    ├── Success → first function
    │
    └── Error   → second function
  */
  (response: AxiosResponse) => response, // This handles successful responses, simply returns the response unchanged.

  (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      console.error('Unexpected non-Axios error:', error);
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
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
  }
);

export default api;
/*
the complete flow:
Feed
 │
 │ useFeed()
 ↓
React Query
 │
 │ GET /feed
 ↓
Axios
 │
 ↓
Backend
 │
 ├───────────────┐
 │               │
200              500
 │               │
 ↓               ↓
success       interceptor
 │               │
 ↓               ↓
data         case 500
                 │
                 ↓
          Promise.reject(error)
                 │
                 ↓
             React Query
                 │
                 ↓
             isError
                 │
                 ↓
             Feed UI
                 │
                 ↓
          "Unable to load feed"
*/
