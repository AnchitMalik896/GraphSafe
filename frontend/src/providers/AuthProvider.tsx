import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { authService } from '@/services/auth.service';
import type { User } from '@/types/auth';
import { UNAUTHORIZED_EVENT } from '@/utils/authEvents';
import { clearToken, getToken, setToken } from '@/utils/tokenStorage';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const currentUser = await authService.getMe();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        await refreshUser();
      } catch {
        clearToken();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string; rememberMe: boolean }) => {
      const { user: loggedInUser, token } = await authService.login({
        email: input.email,
        password: input.password,
      });
      setToken(token, input.rememberMe);
      setUser(loggedInUser);
    },
    [],
  );

  // Backend register does not issue a token, so we log in right after
  // registering to fulfil "redirect to dashboard on success".
  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      await authService.register(input);
      const { user: loggedInUser, token } = await authService.login({
        email: input.email,
        password: input.password,
      });
      setToken(token, true);
      setUser(loggedInUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}