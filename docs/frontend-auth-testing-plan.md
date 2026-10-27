---
name: Frontend Auth Testing Plan
overview: "Manual + future automated tests for cookie session, proactive refresh, Axios 401 safety net, multi-tab lock, Google OAuth, forgot-password resend cooldown, and route guards."
isProject: false
---

# Frontend Authentication Testing Plan

## Goal

Verify the SPA correctly handles **dual httpOnly cookies** (access + refresh), AuthProvider bootstrap, proactive refresh from `accessTokenExpiresAt`, Axios 401→refresh→retry, multi-tab coordination, Google redirect, forgot/reset password (including resend cooldown synced to backend `retryAfter`), and route guards — without relying on tokens in `localStorage`.

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

## Phase 3 — Proactive refresh 

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

Cooldown is **60 seconds** per email (backend-enforced). Frontend countdown is UX only; `retryAfter` from the API is authoritative.

| # | Case | Steps | Expected |
| - | ---- | ----- | -------- |
| 7.1 | Forgot success | Open `/forgot-password` → submit a valid local-account email | `POST /auth/forgot-password` → **200**; body includes `message` + `retryAfter` (e.g. `60`); success banner shown; check inbox if SMTP configured |
| 7.2 | No enumeration | Submit a random / unknown email | Still **200** with the same-style success message (do not reveal whether the email exists) | 
| 7.3 | Countdown UX | After a successful send | UI shows “Didn't receive the email?” and **Resend in Ns** counting down to **Resend**; Resend disabled while `remaining > 0` |
| 7.4 | Resend after cooldown | Wait until countdown hits 0 → click **Resend** | Second `POST /auth/forgot-password` → **200** with new `retryAfter`; countdown restarts; success message updates |
| 7.5 | Client bypass / 429 sync | During countdown, force another request (DevTools Network replay, or submit again quickly) | Backend returns **429** with `{ message, retryAfter }`; UI shows the error and **resyncs countdown** from `retryAfter` (not a stale client timer) |
| 7.6 | Skip refresh on 401 | Wrong credentials on other auth pages is separate; on forgot-password | Failed/429 forgot calls must **not** trigger `POST /auth/refresh-token` (endpoint is in `AUTH_SKIP_REFRESH`) |
| 7.7 | Reset with token | Open `/reset-password?token=...` from email → set new password | **200**; can sign in with new password |
| 7.8 | Sessions revoked after reset | Complete reset while another tab is still logged in | Old refresh sessions invalidated — other tab loses session on next API/refresh; must login again |
| 7.9 | Same as current password | Reset with the same password the account already uses | Backend **400**; form shows error message |
| 7.10 | Invalid / expired token | Open reset page with bad or used token | Error from API; password not changed |

### Phase 7 pass criteria

- Frontend never treats its local timer as security; spam/bypass still hits **429**.
- Successful and unknown-email flows look the same (no enumeration).
- After reset, previous sessions cannot keep using the old refresh cookie.

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
6. Phase 6 (Google)  
7. Phase 7 (forgot + resend cooldown + reset) — use Network tab for `retryAfter` / 429  
8. Phase 8  

---

## Future automated tests

### How to implement (step-by-step)

Run from `frontend/`.

#### Step 1 — Install tooling

```bash
npm install -D vitest happy-dom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw @playwright/test
npx playwright install chromium   # only needed for E2E
```

Scripts already in `package.json`:

| Script | Purpose |
| ------ | ------- |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest watch |
| `npm run test:e2e` | Playwright |

Vitest lives in `vite.config.ts` (`environment: 'happy-dom'`, `include: src/__tests__/**/*.{test,spec}.{ts,tsx}`, `exclude: e2e`).

#### Step 2 — Shared harness (inside `src/__tests__/`)

| File | Role |
| ---- | ---- |
| `setup.ts` | MSW lifecycle + Testing Library cleanup |
| `test-utils.tsx` | `renderWithProviders` (Router + optional AuthProvider) |
| `fixtures/auth.ts` | Fake user / login / forgot / 429 payloads |
| `mocks/handlers.ts` | Default MSW handlers for `/auth/*` |
| `mocks/server.ts` | `setupServer(...handlers)` |

Import as `@/__tests__/mocks/server`, `@/__tests__/fixtures/auth`, etc.

#### Step 3 — Unit tests (mirrored under `src/__tests__/`)

| File | Asserts |
| ---- | ------- |
| `__tests__/features/auth/schemas/authSchemas.test.ts` | Valid / invalid Zod payloads |
| `__tests__/utils/error.test.ts` | `getApiError` reads `retryAfter` on 429 |
| `__tests__/features/auth/api/refreshSession.test.ts` | Success, single-flight, peer lock, failure |
| `__tests__/api/axios.test.ts` | 401 → refresh → retry; login 401 skips refresh |
| `__tests__/features/auth/hooks/useAuth.test.tsx` | Throws outside provider; returns context |
| `__tests__/features/auth/hooks/useForm.test.ts` | Validation, submit, `apiError` mapping |

#### Step 4 — Component tests

| File | Asserts |
| ---- | ------- |
| `__tests__/features/auth/context/AuthProvider.test.tsx` | Mount → `/me`; logout path when `/me` 401 |
| `__tests__/features/auth/components/SignIn.test.tsx` | Validation; success → home; 401 |
| `__tests__/features/auth/components/Signup.test.tsx` | Validation; success → home; 409 |
| `__tests__/features/auth/components/ForgetPassword.test.tsx` | Success countdown; 429 syncs UI |
| `__tests__/features/auth/components/ResetPassword.test.tsx` | Missing token; validation; success → sign-in; expired token API error |

#### Step 5 — E2E (Playwright)

| File | Asserts |
| ---- | ------- |
| `e2e/auth/forgot-reset-password.spec.ts` | Forgot form + countdown (skips if API down) |
| `e2e/auth/session-restore.spec.ts` | Logged-out `/` → `/signIn` |
| `e2e/auth/register-login.spec.ts` | Signup + bad login |

```bash
# terminals: backend + frontend running
npm run test:e2e
```

Optional login cookie check: set `E2E_EMAIL` / `E2E_PASSWORD`.

#### Step 6 — Run checklist

```bash
npm test                 # must be green on every PR
npm run test:e2e         # when stack is up
```

**Current status:** Mirrored `__tests__/` tree; `npm test` covers unit + component suites.

### Folder structure

Everything Vitest-related lives under `src/__tests__/`. Production code stays clean. E2E stays at repo root.

```text
frontend/
├── src/
│   ├── api/axios.ts
│   ├── utils/error.ts
│   ├── features/auth/          # production only
│   └── __tests__/              # all Vitest code
│       ├── setup.ts
│       ├── test-utils.tsx
│       ├── fixtures/auth.ts
│       ├── mocks/
│       │   ├── handlers.ts
│       │   └── server.ts
│       ├── api/axios.test.ts
│       ├── utils/error.test.ts
│       └── features/auth/
│           ├── api/refreshSession.test.ts
│           ├── schemas/authSchemas.test.ts
│           ├── context/AuthProvider.test.tsx
│           ├── components/
│           │   ├── SignIn.test.tsx
│           │   ├── Signup.test.tsx
│           │   └── ForgetPassword.test.tsx
│           └── hooks/
│               ├── useAuth.test.tsx
│               └── useForm.test.ts
├── e2e/                        # Playwright
│   └── auth/
│       ├── register-login.spec.ts
│       ├── session-restore.spec.ts
│       └── forgot-reset-password.spec.ts
├── playwright.config.ts
└── docs/frontend-auth-testing-plan.md
```

**Conventions**

| Layer | Location | Tooling |
| ----- | -------- | ------- |
| Unit / component + harness | `src/__tests__/**` | Vitest + RTL + MSW |
| E2E | `e2e/**/*.spec.ts` | Playwright |
Do **not** put E2E specs under `src/` — they need a real browser and usually a running API (or Playwright route mocks).

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
| SignIn / SignUp | Validation errors; success → navigate home; API 401/409 shown |
| ForgotPasswordForm | Success starts countdown from `retryAfter`; 429 updates `remaining` from response; Resend disabled while cooling down |

### E2E (Playwright)

| Flow | Notes |
| ---- | ----- |
| Register → home → refresh page → still logged in | Use real or test API |
| Delete access cookie → next click recovers | Cookie API in Playwright |
| Logout → protected URL redirects | |
| Forgot → countdown → Resend | Assert 200 then blocked until cooldown; optional stub clock |
| Google | Usually staged / skipped in CI |

---

## Bug report template

When something fails, capture:

- Case ID (e.g. 4.1 / 7.5)
- Backend `JWT_EXPIRES_IN`
- Cookies present before/after (`token` / `refresh_token`)
- Network sequence (status codes for `/me`, `/refresh-token`, `/forgot-password`, failed API)
- For cooldown bugs: request timestamps + response `retryAfter` / `Retry-After` header
- Console errors
- One tab vs two tabs

---

## Out of scope for this plan

- Backend-only unit tests (Sequelize / JWT) — separate plan  
- Load / penetration testing  
- Changing production JWT lifetimes during manual QA without restoring them after
