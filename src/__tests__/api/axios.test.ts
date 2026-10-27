/*
  This file contains the tests for the axios interceptor.
  It's used to test the axios interceptor and the refreshSession function.
*/
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import api from '@/api/axios';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';
import { server } from '@/__tests__/mocks/server';
import { TEST_API_BASE_URL } from '@/__tests__/constants';

vi.mock('@/features/auth/api/refreshSession', () => ({
  refreshSession: vi.fn(),
}));

import { refreshSession } from '@/features/auth/api/refreshSession';

describe('axios interceptor', () => {
  /*
  beforeEach is a function that runs before each test.
  It's used to reset the mock for the refreshSession function and set the mock to return a valid response.
  */
  beforeEach(() => {
    vi.mocked(refreshSession).mockReset();
    vi.mocked(refreshSession).mockResolvedValue({
      user: null,
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  });

  /*
  it is a function that runs a test.
  It's used to test the axios interceptor and the refreshSession function when the request is unauthorized.
  */
  it('on 401 refreshes once then retries the original request', async () => {
    let protectedHits = 0;

    /*
    server.use is a function that sets up the server to return a response when a request is made to the API.
    It's used to test the axios interceptor and the refreshSession function when the request is unauthorized.
    */
    server.use(
      http.get(`${TEST_API_BASE_URL}/posts`, () => {
        protectedHits += 1;
        if (protectedHits === 1) {
          return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        return HttpResponse.json({ items: [] });
      }),
    );

    /*
    response is a variable that stores the response from the API.
    It's used to test the axios interceptor and the refreshSession function when the request is unauthorized.
    */
    const response = await api.get('/posts');

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(protectedHits).toBe(2);
  });

  /*
  it is a function that runs a test.
  It's used to test the axios interceptor and the refreshSession function when the request is unauthorized.
  */
  it('does not call refreshSession on failed login 401', async () => {
    server.use(
      http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, () => {
        return HttpResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 },
        );
      }),
    );

    await expect(
      api.post(AUTH_ENDPOINTS.LOGIN, {
        email: 'a@b.com',
        password: 'wrong',
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(refreshSession).not.toHaveBeenCalled();
  });
});
