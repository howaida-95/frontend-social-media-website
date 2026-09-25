export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  emailVerified: boolean;
  provider: 'google' | 'local' | null;
  googleId: string | null;
  avatar: string | null;
  bio: string | null;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  accessTokenExpiresAt: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
  accessTokenExpiresAt: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UserResponse {
  user: User;
  accessTokenExpiresAt: string | null;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the session is being restored via GET /auth/me on app load */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  startGoogleLogin: () => void;
  clearSession: () => void;
}
