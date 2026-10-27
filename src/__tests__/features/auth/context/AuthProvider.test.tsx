import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import AuthProvider from '@/features/auth/context/AuthProvider';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { renderWithProviders } from '@/__tests__/test-utils';
import { server } from '@/__tests__/mocks/server';
import { mockUser } from '@/__tests__/fixtures/auth';
import { TEST_API_BASE_URL } from '@/__tests__/constants';
import { AUTH_ENDPOINTS } from '@/features/auth/api/auth.endpoints';

const SessionProbe = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <p>loading</p>;
  }

  return (
    <p>
      {isAuthenticated ? `hello ${user?.username}` : 'logged-out'}
    </p>
  );
};

describe('AuthProvider', () => {
  it('restores session from GET /auth/me on mount', async () => {
    renderWithProviders(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
      { withAuth: false },
    );

    expect(screen.getByText('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(`hello ${mockUser.username}`)).toBeInTheDocument();
    });
  });

  it('clears session when /me fails', async () => {
    server.use(
      http.get(`${TEST_API_BASE_URL}${AUTH_ENDPOINTS.ME}`, () => {
        return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }),
    );

    renderWithProviders(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>,
      { withAuth: false },
    );

    await waitFor(() => {
      expect(screen.getByText('logged-out')).toBeInTheDocument();
    });
  });
});
