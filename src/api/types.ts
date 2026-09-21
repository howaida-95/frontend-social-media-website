export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  provider: string;
  googleId: string;
  avatar: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

