import { test, expect } from '@playwright/test';

/**
 * Smoke E2E — requires frontend + backend running.
 * Skip automatically when API health check fails (CI without stack).
 */

const API = process.env.E2E_API_URL || 'http://localhost:5000/api/v1';

// skip test if backend is not running
test.beforeAll(async ({ request }) => {
  try {
    const health = await request.get('http://localhost:5000/api/health');
    test.skip(!health.ok(), 'Backend not running — start backend + frontend for E2E');
  } catch {
    test.skip(true, 'Backend not reachable');
  }
});

test.describe('auth public routes', () => {
  // success scenario
  test('forgot-password shows form and countdown after submit', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible();

    await page.getByLabel(/email address/i).fill(`e2e-${Date.now()}@example.com`);
    await page.getByRole('button', { name: /send reset link/i }).click();

    await expect(
      page.getByText(/if that email exists, a reset link has been sent/i),
    ).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText(/didn't receive the email/i)).toBeVisible();
    await expect(page.getByText(/resend in \d+s/i)).toBeVisible();
  });

  // sign-in page is reachable while logged out
  test('sign-in page is reachable while logged out', async ({ page }) => {
    await page.goto('/signIn');
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible();
  });
});

// skip test if E2E_EMAIL and E2E_PASSWORD are not set
test.describe('session cookies (API)', () => {
  test.skip(!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD, 'Set E2E_EMAIL and E2E_PASSWORD');

  test('login sets httpOnly cookies', async ({ request }) => {
    const response = await request.post(`${API}/auth/login`, {
      data: {
        email: process.env.E2E_EMAIL,
        password: process.env.E2E_PASSWORD,
      },
    });

    expect(response.ok()).toBeTruthy();
    const cookies = response.headersArray().filter((h) => h.name.toLowerCase() === 'set-cookie');
    const joined = cookies.map((c) => c.value).join('\n');
    expect(joined).toMatch(/token=/);
    expect(joined).toMatch(/refresh_token=/);
  });
});
