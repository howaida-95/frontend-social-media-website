export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** True while the session is being restored from storage on app load */
  isLoading: boolean;
  setSession: (response: AuthResponse) => void;
  clearSession: () => void;
}