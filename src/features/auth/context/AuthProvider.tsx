import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/features/auth/api/auth.service';
import { refreshSession } from '@/features/auth/api/refreshSession';
import { setUnauthorizedHandler } from '@/api/axios';
import type {
  AuthContextValue,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/features/auth/types/auth.types';

/*
Auth provider owns session state.

Refresh strategy:
1. PRIMARY — proactive: schedule refresh shortly before accessTokenExpiresAt
2. BACKUP  — axios 401 interceptor → refreshSession → retry
Both paths share refreshSession (single-flight + multi-tab lock).
*/

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Refresh this many ms before access JWT exp */
const SAFETY_MARGIN_MS = 60_000;
/** Avoid tight loops if clock skew / already near expiry */
const MIN_REFRESH_DELAY_MS = 5_000;

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);
  const accessExpiresAtRef = useRef<number | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const clearSession = useCallback(() => {
    clearRefreshTimer();
    accessExpiresAtRef.current = null;
    setUser(null);
  }, [clearRefreshTimer]);

  // This function is used to schedule a proactive refresh of the session.
  const scheduleProactiveRefresh = useCallback(
    (accessTokenExpiresAt: string) => {
      clearRefreshTimer();

      const expiresAtMs = new Date(accessTokenExpiresAt).getTime();
      if (Number.isNaN(expiresAtMs)) {
        return;
      }

      accessExpiresAtRef.current = expiresAtMs;
      const delayMs = Math.max(
        MIN_REFRESH_DELAY_MS,
        expiresAtMs - Date.now() - SAFETY_MARGIN_MS,
      );

      refreshTimerRef.current = window.setTimeout(() => {
        void refreshSession()
          .then((result) => {
            if (result.user) {
              setUser(result.user);
            }
            if (result.accessTokenExpiresAt) {
              scheduleProactiveRefresh(result.accessTokenExpiresAt);
            }
          })
          .catch(() => {
            // Safety net: next API 401 → interceptor refresh / clearSession
          });
      }, delayMs);
    },
    [clearRefreshTimer],
  );

  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { user: currentUser, accessTokenExpiresAt } = await authService.getUser();
      setUser(currentUser);
      if (accessTokenExpiresAt) {
        scheduleProactiveRefresh(accessTokenExpiresAt);
      }
    } catch {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [scheduleProactiveRefresh, clearSession]);

  useEffect(() => {
    void restoreSession();
    return () => clearRefreshTimer();
  }, [restoreSession, clearRefreshTimer]);

  // If tab was sleeping / timers throttled, catch up when visible again
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible' || !user) {
        return;
      }

      const expiresAt = accessExpiresAtRef.current;
      const shouldRefreshNow =
        expiresAt === null || Date.now() >= expiresAt - SAFETY_MARGIN_MS;

      if (!shouldRefreshNow) {
        return;
      }

      void refreshSession()
        .then((result) => {
          if (result.user) {
            setUser(result.user);
          }
          if (result.accessTokenExpiresAt) {
            scheduleProactiveRefresh(result.accessTokenExpiresAt);
          }
        })
        .catch(() => {
          // leave session; interceptor handles hard failure on next API call
        });
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [user, scheduleProactiveRefresh]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user: loggedInUser, accessTokenExpiresAt } =
        await authService.login(payload);
      setUser(loggedInUser);
      scheduleProactiveRefresh(accessTokenExpiresAt);
      return loggedInUser;
    },
    [scheduleProactiveRefresh],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { user: registeredUser, accessTokenExpiresAt } =
        await authService.register(payload);
      setUser(registeredUser);
      scheduleProactiveRefresh(accessTokenExpiresAt);
      return registeredUser;
    },
    [scheduleProactiveRefresh],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const startGoogleLogin = useCallback(() => {
    window.location.assign(authService.getGoogleAuthUrl());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      startGoogleLogin,
      clearSession,
    }),
    [user, isLoading, login, register, logout, startGoogleLogin, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
