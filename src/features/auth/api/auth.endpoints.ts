// endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    // used as a full-page navigation URL, not an axios POST request
    GOOGLE_AUTH: '/auth/google',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
} as const;