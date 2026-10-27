import { describe, expect, it, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { refreshSession } from '@/features/auth/api/refreshSession';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';
import { server } from '@/__tests__/mocks/server';
import { authFixtures } from '@/__tests__/fixtures/auth';
import { TEST_API_BASE_URL } from '@/__tests__/constants';
import { slowRefreshHandler } from '@/__tests__/mocks/handlers';

describe('refreshSession', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('posts refresh-token and returns user + expiry', async () => {
    const result = await refreshSession();

    expect(result.user?.id).toBe(authFixtures.refreshSuccess.user.id);
    expect(result.accessTokenExpiresAt).toBeTruthy();
  });

  it('reuses inFlight for concurrent callers (single-flight)', async () => {
    let hits = 0;
    server.use(
      http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, async () => {
        hits += 1;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(authFixtures.refreshSuccess);
      }),
    );

    const [a, b, c] = await Promise.all([
      refreshSession(),
      refreshSession(),
      refreshSession(),
    ]);

    expect(hits).toBe(1);
    expect(a.accessTokenExpiresAt).toBe(b.accessTokenExpiresAt);
    expect(b.accessTokenExpiresAt).toBe(c.accessTokenExpiresAt);
  });

  it('waits for peer tab when lock is held and returns null user', async () => {
    localStorage.setItem('auth-refresh-lock', String(Date.now() + 10_000));

    const channel = new BroadcastChannel('auth-refresh');
    const expiry = authFixtures.refreshSuccess.accessTokenExpiresAt;

    // Peer finishes shortly after we start waiting
    window.setTimeout(() => {
      channel.postMessage({
        type: 'refresh-done',
        ok: true,
        accessTokenExpiresAt: expiry,
      });
    }, 20);

    const result = await refreshSession();

    expect(result.user).toBeNull();
    expect(result.accessTokenExpiresAt).toBe(expiry);
    channel.close();
  });

  it('propagates network failure from refresh POST', async () => {
    server.use(slowRefreshHandler);
    server.use(
      http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
    );

    await expect(refreshSession()).rejects.toBeTruthy();
  });
});
