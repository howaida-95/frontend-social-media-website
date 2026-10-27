import { test, expect } from '@playwright/test';

// skip test if backend is not running
test.beforeAll(async ({ request }) => {
  try {
    const health = await request.get('http://localhost:5000/api/health');
    test.skip(!health.ok(), 'Backend not running');
  } catch {
    test.skip(true, 'Backend not reachable');
  }
});

// protected home redirects to sign-in when logged out
test('protected home redirects to sign-in when logged out', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/');
  await expect(page).toHaveURL(/signIn/i, { timeout: 10_000 });
});
