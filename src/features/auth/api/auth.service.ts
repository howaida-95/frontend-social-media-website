import api from '@/api/axios';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';

import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  LogoutResponse,
  UserResponse,
} from '@/features/auth/types/auth.types';

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const authService = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, data);
    return response.data;
  },

  forgotPassword: async (
    data: ForgotPasswordPayload,
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      data,
    );
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordPayload,
  ): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      data,
    );
    return response.data;
  },

  logout: async (): Promise<LogoutResponse> => {
    const response = await api.post<LogoutResponse>(AUTH_ENDPOINTS.LOGOUT);
    return response.data;
  },

  getUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(AUTH_ENDPOINTS.ME);
    return response.data;
  },

  /** Full-page navigation URL for Google OAuth redirect flow */
  getGoogleAuthUrl: (): string => `${apiBaseUrl}${AUTH_ENDPOINTS.GOOGLE_AUTH}`,
};
