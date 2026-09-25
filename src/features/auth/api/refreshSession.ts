/*
|--------------------------------------------------------------------------
| refreshSession — shared session refresh coordinator
|--------------------------------------------------------------------------
problems that this file solves:
1- Get a new access token when the current one expires, while making sure only one refresh request happens at a time.
2- inFlight => 
boolean that indicates if a refresh request is already happening.
but it doesn't solve the problem of multiple tabs refreshing at the same time. because every tab has its own memory.
3- lock => 
is a cross-tab mutex that prevents multiple tabs from refreshing at the same time.
we use localStorage to store the lock.
BroadcastChannel => peer tabs can wait for the refreshing tab and then use the cookies that were updated by that refresh.


| WHY THIS FILE EXISTS
| --------------------
| Access JWTs are short-lived (~15m). When they expire (or are about to),
| both AuthProvider (proactive timer) and the Axios 401 interceptor call
| the SAME function: refreshSession().
|
| Backend POST /auth/refresh-token:
|   - Reads httpOnly `refresh_token` cookie
|   - Validates hashed row in DB
|   - ROTATES: revokes old refresh, issues new access JWT + new refresh cookie
              Access expired
                    ↓
          ┌─────────┴─────────┐
          ↓                   ↓
      Request A            Request B
          ↓                   ↓
        401                 401
          └─────────┬─────────┘
                    ↓
             refreshSession()
                    ↓
             ONE refresh call
                    ↓
                Token B
                    ↓
          ┌─────────┴─────────┐
          ↓                   ↓
      Retry A              Retry B
      
Someone asks for a session refresh.

        ↓

Is this tab already refreshing?
        │
       YES
        ↓
Wait for the existing refresh.

       NO
        ↓

Is another tab refreshing?
        │
       YES
        ↓
Wait for that tab.

       NO
        ↓

Take the lock.

        ↓

Send ONE refresh request.

        ↓

Backend gives new tokens/cookies.

        ↓

Tell other tabs:
"Refresh succeeded."

        ↓

Release the lock.

        ↓

Let everyone continue.

| Because rotation invalidates the previous refresh token, you must never
| fire multiple concurrent refresh POSTs (same tab OR across tabs). Doing so
| looks like "token reuse / theft" and can revoke all sessions.
|
| WHO CALLS THIS
| --------------
| 1. AuthProvider — primary path: schedule refresh at exp − 60s
| 2. axios interceptor — safety net: API returned 401 → refresh → retry
|
| WHAT THIS MODULE GUARANTEES
| ---------------------------
| A) Single-flight (same tab)
|    If 5 API calls get 401 at once, only ONE refresh runs; all waiters
|    share the same Promise (`inFlight`).
|
| B) Multi-tab lock
|    Only one browser tab performs the refresh POST. Other tabs wait via
|    BroadcastChannel and reuse the updated cookies the browser already has.
|
| C) No interceptor recursion
|    Uses a bare axios instance (`refreshClient`) with NO response
|    interceptors. If we used the main `api` client, a failed refresh 401
|    would try to refresh again → infinite loop.
|
| D) Returns scheduling metadata
|    `{ user, accessTokenExpiresAt }` so AuthProvider can reschedule the
|    next proactive refresh. Peer tabs get `user: null` but still receive
|    `accessTokenExpiresAt` over BroadcastChannel.
|
| COOKIES (httpOnly — JS cannot read them)
| ----------------------------------------
| Browser automatically sends them because withCredentials: true.
| After a successful refresh, Set-Cookie updates both cookies in this
| origin's cookie jar for ALL tabs sharing the origin.
|

Understand these three concepts:

1. inFlight

Prevents multiple refresh requests inside the same tab.

5 failed requests
      ↓
ONE refresh
2. localStorage lock

Prevents multiple tabs from refreshing simultaneously.

Tab 1 ── refresh
Tab 2 ── wait
Tab 3 ── wait
3. BroadcastChannel

Tells other tabs that the refresh finished.

Tab 1 → "Refresh completed"
          ↓
       Tab 2
       Tab 3
inFlight handles multiple requests in one tab, localStorage coordinates different tabs, and BroadcastChannel tells waiting tabs that the refresh is finished.
*/

import axios from 'axios';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';
import type { User } from '@/features/auth/types/auth.types';

const apiBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/**
 * Dedicated axios instance used ONLY for POST /auth/refresh-token.
 * Intentionally has no interceptors — refresh must not trigger itself.
 * withCredentials: true so the httpOnly refresh_token cookie is sent.
 */
const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/** BroadcastChannel name — all tabs of this origin join the same channel */
const CHANNEL_NAME = 'auth-refresh';

/**
 * localStorage key holding a timestamp (ms) until which a tab "owns"
 * the refresh. Simple cross-tab mutex (not perfect under extreme races,
 * but good enough with BroadcastChannel as the signal).
 */
const LOCK_KEY = 'auth-refresh-lock';

/** How long a lock is valid before another tab may steal it (stale lock) */
const LOCK_TTL_MS = 10_000;

/**
 * Messages exchanged between tabs on BroadcastChannel.
 * - refresh-start: optional signal that a tab began refreshing
 * - refresh-done ok:true: peer should treat cookies as renewed; includes
 *   accessTokenExpiresAt so peers can schedule their own proactive timer
 * - refresh-done ok:false: peer refresh failed; waiters may try themselves
 */
type RefreshMessage =
  | { type: 'refresh-start' }
  | {
      type: 'refresh-done';
      ok: true;
      accessTokenExpiresAt: string | null;
    }
  | { type: 'refresh-done'; ok: false };

/**
 * Result returned to AuthProvider / interceptor callers.
 * - user: set when THIS tab hit the API; null when a peer tab refreshed
 *   (cookies are already updated in the shared cookie jar either way)
 * - accessTokenExpiresAt: ISO expiry of the new access JWT (for scheduling)
 */
export type RefreshResult = {
  user: User | null;
  accessTokenExpiresAt: string | null;
};

/**
 * Same-tab single-flight handle.
 * While a refresh is running, every refreshSession() call returns this
 * same Promise instead of starting another POST.
 */
let inFlight: Promise<RefreshResult> | null = null; // Is a refresh request already happening?

/** Lazily created BroadcastChannel singleton for this JS realm (tab) */
let channel: BroadcastChannel | null = null;

/** Get or create the cross-tab channel; null if API unsupported (SSR / old browsers) */
const getChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
};

/**
 * Try to become the tab that performs the refresh POST.
 * Returns false if another tab still holds a non-expired lock.
 * On localStorage failure (private mode quirks), returns true so we still
 * attempt refresh rather than hanging forever.
 */
const tryAcquireLock = (): boolean => {
  try {
    const raw = localStorage.getItem(LOCK_KEY);
    const now = Date.now();
    if (raw) {
      const until = Number(raw);
      // Another tab's lock is still active
      if (!Number.isNaN(until) && until > now) {
        return false;
      }
    }
    const until = String(now + LOCK_TTL_MS);
    localStorage.setItem(LOCK_KEY, until);
    // Cheap check we wrote the value (best-effort; not a perfect CAS)
    return localStorage.getItem(LOCK_KEY) === until;
  } catch {
    return true;
  }
};

/** Clear the cross-tab lock so other tabs can refresh later */
const releaseLock = (): void => {
  try {
    localStorage.removeItem(LOCK_KEY);
  } catch {
    // ignore quota / privacy errors
  }
};

type PeerRefreshOutcome =
  | { ok: true; accessTokenExpiresAt: string | null }
  | { ok: false };

/**
 * Wait until another tab posts refresh-done on BroadcastChannel,
 * or until timeout (stale lock / silent peer).
 * On success, cookies were already updated by the peer's Set-Cookie response;
 * we only need the new accessTokenExpiresAt for scheduling.
 */
const waitForPeerRefresh = (timeoutMs = LOCK_TTL_MS): Promise<PeerRefreshOutcome> =>
  new Promise((resolve) => {
    const ch = getChannel();
    if (!ch) {
      // No channel → cannot wait for peers; fail fast so caller may refresh itself
      window.setTimeout(() => resolve({ ok: false }), 500);
      return;
    }

    const timer = window.setTimeout(() => {
      ch.removeEventListener('message', onMessage);
      resolve({ ok: false });
    }, timeoutMs);

    const onMessage = (event: MessageEvent<RefreshMessage>) => {
      const data = event.data;
      if (data?.type !== 'refresh-done') {
        return;
      }
      window.clearTimeout(timer);
      ch.removeEventListener('message', onMessage);
      if (data.ok) {
        resolve({
          ok: true,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
        });
        return;
      }
      resolve({ ok: false });
    };

    ch.addEventListener('message', onMessage);
  });

/** Actual network call to rotate tokens (this tab is the lock owner) */
const postRefresh = async (): Promise<RefreshResult> => {
  const { data } = await refreshClient.post<{
    message: string;
    user: User;
    accessTokenExpiresAt: string;
  }>(AUTH_ENDPOINTS.REFRESH_TOKEN);

  return {
    user: data.user,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
  };
};

/**
 * refreshSession()
 *
 * Entry point used by AuthProvider and the Axios interceptor.
 *
 * Flow:
 *  1. If a refresh is already running in THIS tab → return the same Promise
 *  2. Try to acquire the cross-tab lock
 *     - Fail → wait for peer BroadcastChannel message
 *       - Peer ok → return { user: null, accessTokenExpiresAt } (cookies ready)
 *       - Peer fail / timeout → try lock again briefly, else proceed ourselves
 *  3. POST /auth/refresh-token with refreshClient
 *  4. Broadcast success/failure + release lock
 *  5. Clear inFlight so the next refresh can start later
 */
export const refreshSession = (): Promise<RefreshResult> => {
  // --- A) Same-tab single-flight ---
  // inFlight already exists. So it doesn't start another refresh.
  if (inFlight) {
    return inFlight;
  }

  // There is no refresh happening, so it starts one.
  inFlight = (async () => {
    const ch = getChannel();

    // --- B) Multi-tab: if another tab owns the lock, wait for it ---
    if (!tryAcquireLock()) { // Am I allowed to perform the refresh?
      const peer = await waitForPeerRefresh();
      if (peer.ok) { // Great. The other tab refreshed the cookies. I don't need to refresh again
        return {
          user: null,
          accessTokenExpiresAt: peer.accessTokenExpiresAt,
        };
      }
      // Peer timed out or failed — try once more, then take over if needed
      if (!tryAcquireLock()) {
        const retry = await waitForPeerRefresh(2000);
        if (retry.ok) {
          return {
            user: null,
            accessTokenExpiresAt: retry.accessTokenExpiresAt,
          };
        }
      }
    }

    // --- C) We own the lock: perform the refresh ---
    // Hey other tabs, I successfully refreshed the session.
    ch?.postMessage({ type: 'refresh-start' } satisfies RefreshMessage);

    try {
      const result = await postRefresh();
      // Tell other tabs cookies are renewed and share the new expiry
      ch?.postMessage({
        type: 'refresh-done',
        ok: true,
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      } satisfies RefreshMessage);
      return result;
    } catch (error) {
      ch?.postMessage({ type: 'refresh-done', ok: false } satisfies RefreshMessage);
      throw error;
    } finally {
      releaseLock(); // I'm finished. Other tabs are allowed to refresh later.
    }
  })().finally(() => {
    // Allow a future refresh (next proactive tick or later 401 batch)
    inFlight = null;
  });

  return inFlight;
};
