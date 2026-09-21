import api from '@/api/axios';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';

import type { 
  LoginPayload, 
  LoginResponse, 
  RegisterPayload, 
  RegisterResponse,
  RefreshTokenPayload, 
  RefreshTokenResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  LogoutResponse,
  GoogleAuthResponse,
  UserResponse } from '@/features/auth/types/auth.types';

// auth service
export const authService = {

// login
  login: async(data: LoginPayload): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// register
  register: async(data: RegisterPayload): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>(AUTH_ENDPOINTS.REGISTER, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// refresh token
  refreshToken: async(data: RefreshTokenPayload): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.post<RefreshTokenResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// forgot password
  forgotPassword: async(data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post<ForgotPasswordResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// reset password
  resetPassword: async(data: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    try {
      const response = await api.post<ResetPasswordResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// logout
  logout: async(): Promise<LogoutResponse> => {
    try {
      const response = await api.post<LogoutResponse>(AUTH_ENDPOINTS.LOGOUT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

// google auth
  googleAuth: async(): Promise<GoogleAuthResponse> => {
    try {
      const response = await api.get<GoogleAuthResponse>(AUTH_ENDPOINTS.GOOGLE_AUTH);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  

// get user
  getUser: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>(AUTH_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};