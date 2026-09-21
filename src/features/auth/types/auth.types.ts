export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isVerified: boolean;
  isPremium: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenPayload {
  refreshToken: string; // from cookies
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
} 

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordPayload {
  token: string; // from email
  newPassword: string; // new password
}

export interface ResetPasswordResponse {
  success: boolean; 
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
}

export interface UserResponse {
  user: User;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the session is being restored from storage on app load */
  isLoading: boolean;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
}