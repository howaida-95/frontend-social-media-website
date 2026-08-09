// endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },

  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
  },
} as const;