import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against a running stack:
 *   backend :5000
 *   frontend: npm run dev → :5173
 *
 * Optional: set E2E_EMAIL / E2E_PASSWORD for login flows.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
