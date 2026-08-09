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
}

/*
Your service becomes:
----------------------
export const getUser = async (
  id: string
): Promise<User> => {
  const response = await api.get<ApiResponse<User>>(
    `/users/${id}`
  );
  return response.data.data;
};

*/