
import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { getApiError } from '@/utils/error';

describe('getApiError', () => {
  it('reads message and retryAfter from an Axios response', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {},
        config: { headers: {} } as never,
        data: {
          message: 'Please wait before requesting another reset email.',
          retryAfter: 42,
        },
      },
    );

    expect(getApiError(error)).toEqual({
      message: 'Please wait before requesting another reset email.',
      status: 429,
      code: undefined,
      retryAfter: 42,
      errors: undefined,
    });
  });

  it('falls back for plain Error instances', () => {
    expect(getApiError(new Error('boom'))).toEqual({
      message: 'boom',
    });
  });
});
