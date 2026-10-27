
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
import SignUpForm from '@/features/auth/components/Signup';
import { renderWithProviders } from '@/__tests__/test-utils';
import { server } from '@/__tests__/mocks/server';
import { TEST_API_BASE_URL } from '@/__tests__/constants';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';

// helper function to fill valid signup form
const fillValidSignUp = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.type(screen.getByLabelText(/first name/i), 'Ada');
  await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
  await user.type(screen.getByLabelText(/^username$/i), 'ada123');
  await user.type(screen.getByLabelText(/email address/i), 'ada@example.com');
  await user.type(screen.getByLabelText(/^password$/i), 'Password1');
  await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
};

// render signup form with memory router
const renderSignUp = () =>
  renderWithProviders(
    <Routes>
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/" element={<p>home</p>} />
    </Routes>,
    { route: '/signup' },
  );

describe('SignUpForm', () => {
  // weak password and mismatch password scenario
  it('shows validation errors for weak password and mismatch', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/first name/i), 'Ada');
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
    await user.type(screen.getByLabelText(/^username$/i), 'ada123');
    await user.type(screen.getByLabelText(/email address/i), 'ada@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'other');
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });

  // success scenario
  it('registers and navigates home on success', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await fillValidSignUp(user);
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    await waitFor(() => {
      expect(screen.getByText('home')).toBeInTheDocument();
    });
  });

  // email already in use scenario
  it('shows API error when email is already in use', async () => {
    server.use(
      http.post(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.REGISTER}`, () => {
        return HttpResponse.json(
          { message: 'Email already in use' },
          { status: 409 },
        );
      }),
    );

    const user = userEvent.setup();
    renderSignUp();

    await fillValidSignUp(user);
    await user.click(screen.getByRole('button', { name: /^continue$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /email already in use/i,
    );
    expect(screen.queryByText('home')).not.toBeInTheDocument();
  });
});
