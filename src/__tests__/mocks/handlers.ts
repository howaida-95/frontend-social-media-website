/*
A mock handler tells the test what should happen when the application makes a specific API request.
*/
import { http, HttpResponse, delay } from 'msw';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';
import { authFixtures } from '@/__tests__/fixtures/auth';
import { TEST_API_BASE_URL } from '@/__tests__/constants';

export const handlers = [
  http.get(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.ME}`, () => {
    return HttpResponse.json(authFixtures.meSuccess);
  }),

  http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, async () => {
    return HttpResponse.json(authFixtures.loginSuccess);
  }),

  http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`, async () => {
    return HttpResponse.json(
      {
        message: 'User created successfully',
        user: authFixtures.loginSuccess.user,
        accessTokenExpiresAt: authFixtures.loginSuccess.accessTokenExpiresAt,
      },
      { status: 201 },
    );
  }),

  http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, async () => {
    return HttpResponse.json(authFixtures.refreshSuccess);
  }),

  http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, () => {
    return HttpResponse.json({ message: 'Logout successful' });
  }),

  http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`, async () => {
    return HttpResponse.json(authFixtures.forgotSuccess);
  }),

  http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, async () => {
    return HttpResponse.json({ message: 'Password reset successfully' });
  }),
];

/** Slow refresh — useful for single-flight / concurrent waiter tests */
export const slowRefreshHandler = http.post(
  `${TEST_API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
  async () => {
    await delay(80);
    return HttpResponse.json(authFixtures.refreshSuccess);
  },
);

export const forgotPassword429Handler = http.post(
  `${TEST_API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`,
  async () => {
    return HttpResponse.json(authFixtures.forgotCooldown, { status: 429 });
  },
);
