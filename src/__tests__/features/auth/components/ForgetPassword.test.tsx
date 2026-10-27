/*
Step 1 — What behavior are we testing?
Login functionality.

Step 2 — What can happen ( what are scenarios)?
Success
Invalid email
Server error
Network error
429 → retry after

Step 3 — What should the user see/do?
Success → success message and countdown from retryAfter
Invalid email → error message
Server error → generic error
Network error → generic error
429 → retry after countdown message

Step 4 — What level should test this?
Pure calculation → Unit
React UI behavior → RTL
API behavior from frontend → MSW + RTL
Critical user journey → Playwright

Step 5 — What dependencies need to be controlled?
API → MSW
Router → MemoryRouter
Auth → AuthProvider / mock auth
Date/time → mock if necessary

*/

import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '@/features/auth/components/ForgetPassword';
import { renderWithProviders } from '@/__tests__/test-utils';
import { server } from '@/__tests__/mocks/server';
import { authFixtures } from '@/__tests__/fixtures/auth';
import { forgotPassword429Handler } from '@/__tests__/mocks/handlers';

describe('ForgotPasswordForm', () => {
  // success scenario
  it('shows success and countdown from retryAfter after send', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, { withAuth: false });

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(
      await screen.findByText(authFixtures.forgotSuccess.message),
    ).toBeInTheDocument();
    expect(screen.getByText(/didn't receive the email/i)).toBeInTheDocument();
    expect(screen.getByText(/resend in 60s/i)).toBeInTheDocument();
  });

  // 429 retry after scenario
  it('syncs countdown from 429 retryAfter', async () => {
    server.use(forgotPassword429Handler);
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />, { withAuth: false });

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(
      await screen.findByText(authFixtures.forgotCooldown.message),
    ).toBeInTheDocument();
    expect(screen.getByText(/resend in 42s/i)).toBeInTheDocument();
  });
});
