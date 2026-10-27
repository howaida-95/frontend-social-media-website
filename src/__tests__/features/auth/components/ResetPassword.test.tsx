/*
Step 1 — What behavior are we testing?
Reset password functionality.

Step 2 — What can happen ( what are scenarios)?
Success
Invalid or expired token
Server error
Network error
429 → retry after

Step 3 — What should the user see/do?
Success → success message and countdown from retryAfter
Invalid or expired token → error message
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
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import ResetPasswordForm from '@/features/auth/components/ResetPassword';
import { renderWithProviders } from '@/__tests__/test-utils';
import { server } from '@/__tests__/mocks/server';
import { TEST_API_BASE_URL } from '@/__tests__/constants';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';

// helper function to render reset password form with memory router
const renderResetPassword = (route = '/reset-password?token=valid-token') =>
  renderWithProviders(
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordForm />} />
      <Route path="/signIn" element={<p>sign-in</p>} />
    </Routes>,
    { route, withAuth: false },
  );

describe('ResetPasswordForm', () => {
  // invalid or missing token scenario
  it('shows an alert when the reset token is missing', () => {
    renderResetPassword('/reset-password');

    expect(screen.getByRole('alert')).toHaveTextContent(
      /invalid or missing reset link/i,
    );
    expect(
      screen.queryByRole('button', { name: /reset password/i }),
    ).not.toBeInTheDocument();
  });

  // weak password scenario
  it('shows validation errors for a weak password', async () => {
    const user = userEvent.setup();
    renderResetPassword();

    await user.type(screen.getByLabelText(/new password/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'short');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });
  
  // success scenario
  it('resets password and navigates to sign-in on success', async () => {
    const user = userEvent.setup();
    renderResetPassword();

    await user.type(screen.getByLabelText(/new password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(screen.getByText('sign-in')).toBeInTheDocument();
    });
  });

  // invalid or expired token scenario
  it('shows API error for an invalid or expired token', async () => {
    server.use(
      http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, () => {
        return HttpResponse.json(
          { message: 'Invalid or expired reset token' },
          { status: 400 },
        );
      }),
    );

    const user = userEvent.setup();
    renderResetPassword('/reset-password?token=expired-token');

    await user.type(screen.getByLabelText(/new password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid or expired reset token/i,
    );
    expect(screen.queryByText('sign-in')).not.toBeInTheDocument();
  });
});
