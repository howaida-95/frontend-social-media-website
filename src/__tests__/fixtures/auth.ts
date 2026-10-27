
/*
A fixture is reusable test setup or test data that prepares the environment or dependencies needed by a test.
*/
import type { User } from '@/features/auth/types/auth.types';

export const mockUser: User = {
  id: 15,
  firstName: 'Howaida',
  lastName: 'Sayed',
  username: 'howaida',
  email: 'howaida@example.com',
  emailVerified: true,
  provider: 'local',
  googleId: null,
  avatar: null,
  bio: null,
  role: 'user',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

/** Far enough in the future that proactive refresh won't fire immediately */
export const futureAccessExpiry = () =>
  new Date(Date.now() + 15 * 60 * 1000).toISOString();

export const authFixtures = {
  loginSuccess: {
    message: 'Login successful',
    user: mockUser,
    accessTokenExpiresAt: futureAccessExpiry(),
  },
  meSuccess: {
    user: mockUser,
    accessTokenExpiresAt: futureAccessExpiry(),
  },
  refreshSuccess: {
    message: 'Token refreshed',
    user: mockUser,
    accessTokenExpiresAt: futureAccessExpiry(),
  },
  forgotSuccess: {
    message: 'If that email exists, a reset link has been sent',
    retryAfter: 60,
  },
  forgotCooldown: {
    success: false,
    message: 'Please wait before requesting another reset email.',
    retryAfter: 42,
  },
};
