/*
Step 1 — What behavior are we testing?
Login functionality.

Step 2 — What can happen ( what are scenarios)?
Success
Invalid credentials
Server error
Network error
Loading

Step 3 — What should the user see/do?
Success → dashboard
401 → error message
500 → generic error
Loading → spinner/disabled button

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
import SignInForm from '@/features/auth/components/SignIn';
import { renderWithProviders } from '@/__tests__/test-utils';
import { server } from '@/__tests__/mocks/server';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';
import { mockUser } from '@/__tests__/fixtures/auth';
import { TEST_API_BASE_URL } from '@/__tests__/constants';

const renderSignIn = () =>
  renderWithProviders(
    <Routes>
      <Route path="/signIn" element={<SignInForm />} />
      <Route path="/" element={<p>home</p>} />
    </Routes>,
    { route: '/signIn' },
  );

describe('SignInForm', () => {
  // empty credentials scenario
  it('shows field errors when submitted empty', async () => {
    const user = userEvent.setup();
    renderSignIn();

    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  // success scenario
  it('logs in and navigates home on success', async () => {
    const user = userEvent.setup();
    renderSignIn();

    await user.type(screen.getByLabelText(/email address/i), mockUser.email);
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(screen.getByText('home')).toBeInTheDocument();
    });
  });

  // invalid credentials scenario
  it('shows API error on invalid credentials', async () => {
    server.use(
      http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, () => {
        return HttpResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 },
        );
      }),
    );

    const user = userEvent.setup();
    renderSignIn();

    await user.type(screen.getByLabelText(/email address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'badpass');
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid email or password/i,
    );
    expect(screen.queryByText('home')).not.toBeInTheDocument();
  });
});
