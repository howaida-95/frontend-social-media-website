/*
  Step 1 — What behavior are we testing?
  Register and login functionality.

  Step 2 — What can happen ( what are scenarios)?
  Success
  Invalid credentials
  Server error
  Network error
  Loading
  
  Step 3 — What should the user see/do?
  Success → dashboard
  Invalid credentials → error message
  Server error → generic error
  Network error → generic error
  Loading → spinner/disabled button

  Step 4 — What level should test this?
  Pure calculation → Unit
  React UI behavior → Playwright
  API behavior from frontend → Playwright
  Critical user journey → Playwright

  Step 5 — What dependencies need to be controlled?
  API → Playwright
  Router → Playwright
  Auth → Playwright
  Date/time → Playwright

  Step 6 — What should the test do?
  Register a new user
  Login with the new user
  Check if the user is logged in
  Check if the user is redirected to the dashboard
  Check if the user is logged out
  Check if the user is redirected to the login page
  Check if the user is redirected to the signup page
*/

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

test.describe('register + login', () => {
  // success scenario
  test('sign-up page validates and can create a user', async ({ page }) => {
    const stamp = Date.now();
    const email = `e2e-${stamp}@example.com`;
    const username = `user${stamp}`.slice(0, 20);

    await page.goto('/signup');

    await page.getByLabel(/first name/i).fill('E2E');
    await page.getByLabel(/last name/i).fill('Tester');
    await page.getByLabel(/^username$/i).fill(username);
    await page.getByLabel(/email address/i).fill(email);
    await page.getByLabel(/^password$/i).fill('Password1');
    await page.getByLabel(/confirm password/i).fill('Password1');
    await page.getByRole('button', { name: /^continue$/i }).click();

    await expect(page).not.toHaveURL(/signup/i, { timeout: 15_000 });
  });

  // invalid credentials scenario
  test('sign-in rejects bad password', async ({ page }) => {
    await page.goto('/signIn');

    await page.getByLabel(/email address/i).fill('nobody@example.com');
    await page.getByLabel(/^password$/i).fill('WrongPass1');
    await page.getByRole('button', { name: /^continue$/i }).click();

    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/signIn/i);
  });
});
