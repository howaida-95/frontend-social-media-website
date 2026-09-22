import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/features/auth/api/auth.service';
import { setUnauthorizedHandler } from '@/api/axios';
import type {
  AuthContextValue,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/features/auth/types/auth.types';

/*
purpose:
1- provide auth context to the app
2- restore session from cookies
3- set unauthorized handler
4- login
5- register
6- logout
7- start google login
8- clear session
*/


// craete context for auth
export const AuthContext = createContext<AuthContextValue | null>(null);

// create provider for auth
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  // restore session from cookies and set user to the current user
  const restoreSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { user: currentUser } = await authService.getUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // restore session on mount
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // set unauthorized handler to clear session when user is not authenticated
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    // clean up unauthorized handler on unmount
    return () => {
      setUnauthorizedHandler(null);
    };
  }, [clearSession]);

  // login user
  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser } = await authService.login(payload);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  // register user
  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: registeredUser } = await authService.register(payload);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  // logout user
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // start google login by redirecting to the google auth url
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
