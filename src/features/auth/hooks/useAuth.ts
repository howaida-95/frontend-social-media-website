import { useContext } from 'react';
import { AuthContext } from '@/features/auth/context/AuthProvider';
import type { AuthContextValue } from '@/features/auth/types/auth.types';

/*
purpose:
1- get auth context
2- throw error if used outside of auth provider
3- return auth context
*/
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
