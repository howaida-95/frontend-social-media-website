import axios from 'axios';
import type { ApiError } from '@/types/api';

export const getApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const response = error.response;

    if (response) {
      return {
        message:
          response.data?.message ||
          'Something went wrong. Please try again.',
        status: response.status,
        code: response.data?.code,
        errors: response.data?.errors,
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        message: 'Request timed out. Please try again.',
      };
    }

    if (error.request) {
      return {
        message: 'Unable to connect to the server.',
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred.',
  };
};