---
name: Frontend Auth Testing Plan
overview: "Manual + future automated tests for cookie session, proactive refresh, Axios 401 safety net, multi-tab lock, Google OAuth, and route guards."
isProject: false
---

# Frontend Authentication Testing Plan

## Goal

Verify the SPA correctly handles **dual httpOnly cookies** (access + refresh), AuthProvider bootstrap, proactive refresh from `accessTokenExpiresAt`, Axios 401→refresh→retry, multi-tab coordination, Google redirect, and route guards — without relying on tokens in `localStorage`.

## Prerequisites

| Check | Value |
| ----- | ----- |
| Backend running | `npm run dev` on `:5000` |
| Frontend running | `npm run dev` on `:5173` |
| Env | `VITE_API_URL=http://localhost:5000/api/v1` |
| Backend env | `JWT_EXPIRES_IN=15m` (or shorter for refresh tests, e.g. `2m`), `REFRESH_TOKEN_EXPIRES_IN=30d` |
| Tools | Chrome DevTools → Application → Cookies; Network tab |

**Tip for refresh tests:** Temporarily set backend `JWT_EXPIRES_IN=2m` so you do not wait 15 minutes. Proactive refresh fires at `exp − 60s`.

---

## Phase 0 — DevTools baseline

Before feature cases, confirm cookies and Network behavior:

1. Open Application → Cookies → `http://localhost:5000` (or your API host).
2. After login you must see:
   - `token` (httpOnly, path `/`)
   - `refresh_token` (httpOnly, path `/`)
3. Confirm **neither** appears in `localStorage` / `sessionStorage`.
4. Network: requests to API include `Cookie` header (or “credentials” / cookies sent) because Axios uses `withCredentials: true`.

---

## Phase 1 — Email auth (happy path)

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 1.1 | Register | Sign up with valid first/last/username/email/password | Redirect/home; both cookies set; UI shows logged-in state |
| 1.2 | Session restore | Hard refresh (`F5`) while logged in | `GET /auth/me` → 200; still logged in; no forced Sign In |
| 1.3 | Login | Logout → Sign In with same credentials | Cookies set again; home accessible |
| 1.4 | Logout | Click logout | `POST /auth/logout` → 200; both cookies cleared; protected routes → `/signIn` |
| 1.5 | Public routes | While logged in, open `/signIn` | Redirect to `/` (PublicRoute) |

### Negative / validation

| # | Case | Expected |
| - | ---- | -------- |
| 1.6 | Bad password | Error message; no cookies; stay on Sign In |
| 1.7 | Duplicate email/username on register | 409 message from API |
| 1.8 | Weak password / Zod client errors | Inline field errors; no API call (or API 400) |

---

## Phase 2 — Route guards & bootstrap

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 2.1 | Cold load logged out | Clear cookies → open `/` or a protected URL | Spinner briefly → redirect `/signIn` |
| 2.2 | Cold load logged in | Valid cookies → open app | Spinner → `/me` 200 → main app |
| 2.3 | Access expired, refresh valid | Delete only `token` cookie (keep `refresh_token`) → hard refresh | `/me` 401 → interceptor refresh → retry `/me` → logged in; new `token` cookie |
| 2.4 | Both cookies gone | Clear all → hard refresh | Logged out; no infinite refresh loop |

---

## Phase 3 — Proactive refresh (PRIMARY)

Requires short `JWT_EXPIRES_IN` (e.g. `2m`) or patience with `15m`.

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 3.1 | Timer before expiry | Login → watch Network idle | One `POST /auth/refresh-token` around **exp − 60s**; status 200; cookies updated; **no** preceding API 401 |
| 3.2 | Reschedule | After refresh response | Next refresh scheduled from new `accessTokenExpiresAt` (another call near next exp − 60s) |
| 3.3 | Visibility catch-up | Login → leave tab in background past safety window (or sleep) → focus tab | May call `/refresh-token` on `visibilitychange` if near/past margin |

**Pass criteria:** User never sees a forced logout solely because access expired while the app was open and refresh was valid.

---

## Phase 4 — Axios interceptor (SAFETY NET)

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 4.1 | 401 → refresh → retry | While logged in, delete `token` only → trigger any authenticated API (e.g. navigate that loads data) | Request 401 → `POST /auth/refresh-token` → original request retried → 200 |
| 4.2 | Single-flight | Delete `token` → fire several API calls at once (open pages / Rapid clicks) | **One** refresh POST; multiple retries succeed |
| 4.3 | Refresh failure | Delete both cookies mid-session → API call | Refresh fails → session cleared → Sign In; no refresh storm |
| 4.4 | Skip auth endpoints | Wrong login password | 401 on `/login` does **not** call `/refresh-token` |

---

## Phase 5 — Multi-tab coordination

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 5.1 | One refresh across tabs | Two tabs logged in; delete `token` in both; trigger API in both quickly | Prefer **one** `/refresh-token` across tabs; both tabs stay logged in |
| 5.2 | Logout one tab | Tab A logout | Tab A logged out. Tab B: next API or refresh may fail / clear (refresh revoked) — user ends logged out on B when session checked |
| 5.3 | No revoke-all from double refresh | Force simultaneous proactive/refresh in two tabs | Should not wipe all sessions via “reuse detection” under normal lock behavior |

---

## Phase 6 — Google OAuth

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 6.1 | Success | Continue with Google → consent → back to app | Land on home; both cookies; `/me` works |
| 6.2 | Cancel / deny | Cancel on Google | `/signIn?error=...` shows friendly message |
| 6.3 | Existing local email conflict | Local account same email, no googleId | Error path / message (backend 400 → failed redirect) |

---

## Phase 7 — Forgot / reset password

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 7.1 | Forgot | Submit email | Success message (no email enumeration); check inbox if SMTP configured |
| 7.2 | Reset | Open link with `?token=` → new password | Success; old sessions revoked — old tabs should lose refresh; must login again |
| 7.3 | Same as current password | If backend rejects | Show error message |

---

## Phase 8 — Security / UX smoke

| # | Case | Expected |
| - | ---- | -------- |
| 8.1 | No token in JS | `document.cookie` does not expose `token` / `refresh_token` (httpOnly) |
| 8.2 | XSS assumption | Nothing auth-critical in `localStorage` |
| 8.3 | CORS + credentials | Cross-origin API calls work only with backend CORS allowing frontend origin + credentials |

---

## Suggested testing order (manual)

1. Phase 0 + 1 (register / login / logout / restore)  
2. Phase 2 (guards + delete-access-only restore)  
3. Phase 4 (interceptor — fastest refresh proof)  
4. Phase 3 (proactive — with short JWT)  
5. Phase 5 (two tabs)  
6. Phase 6–7 (Google + password)  
7. Phase 8  

---

## Future automated tests (optional — not set up yet)

No Vitest/Playwright in the repo today. When adding tests, prefer this order:

### Unit (Vitest)

| Target | What to assert |
| ------ | -------------- |
| `refreshSession` | Second concurrent call reuses `inFlight`; peer lock path returns `user: null` + expiry |
| Axios interceptor | Mock 401 then successful refresh → original retried once; login URL skipped |
| Zod schemas | Valid/invalid register & login payloads |

### Component (React Testing Library)

| Target | What to assert |
| ------ | -------------- |
| AuthProvider | On mount calls `/me`; schedules from `accessTokenExpiresAt`; logout clears user |
| SignIn / SignUp | Submit → service called; errors rendered |

### E2E (Playwright)

| Flow | Notes |
| ---- | ----- |
| Register → home → refresh page → still logged in | Use real or test API |
| Delete access cookie → next click recovers | Cookie API in Playwright |
| Logout → protected URL redirects | |
| Google | Usually staged / skipped in CI |

---

## Bug report template

When something fails, capture:

- Case ID (e.g. 4.1)
- Backend `JWT_EXPIRES_IN`
- Cookies present before/after (`token` / `refresh_token`)
- Network sequence (status codes for `/me`, `/refresh-token`, failed API)
- Console errors
- One tab vs two tabs

---

## Out of scope for this plan

- Backend-only unit tests (Sequelize / JWT) — separate plan  
- Load / penetration testing  
- Changing production JWT lifetimes during manual QA without restoring them after
