/** Same base URL the app Axios client uses (from `.env` → `VITE_API_URL`). */
export const TEST_API_BASE_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:5000/api/v1'
).replace(/\/$/, '');
