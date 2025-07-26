'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { AuthUser, LoginRequest, RegisterRequest } from '@/lib/types/auth';
import type { Organization } from '@/lib/types/database';

interface AuthState {
  user: AuthUser | null;
  organization: Organization | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    organization: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load tokens from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (accessToken && refreshToken) {
      setState((prev) => ({
        ...prev,
        accessToken,
        refreshToken,
      }));
      // Verify token and get user data
      void fetchCurrentUser(accessToken);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch current user data
  const fetchCurrentUser = async (token: string): Promise<void> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = (await response.json()) as {
          data: {
            user: AuthUser;
            organization: Organization;
          };
        };
        setState((prev) => ({
          ...prev,
          user: data.data.user,
          organization: data.data.organization,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        // Token might be expired, try to refresh
        await refreshSession();
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  };

  // Fetch current user data - memoized to avoid infinite loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchCurrentUserMemo = useCallback(fetchCurrentUser, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: { message: string } };
        throw new Error(errorData.error.message ?? 'Login failed');
      }

      const data = (await response.json()) as {
        data: {
          user: AuthUser;
          accessToken: string;
          refreshToken: string;
        };
      };

      // Store tokens
      localStorage.setItem(TOKEN_KEY, data.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);

      // Update state
      setState((prev) => ({
        ...prev,
        user: data.data.user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      }));

      // Fetch organization data
      await fetchCurrentUserMemo(data.data.accessToken);

      // Redirect to dashboard
      router.push('/dashboard');
    },
    [router, fetchCurrentUserMemo]
  );

  // Register function
  const register = useCallback(
    async (data: RegisterRequest): Promise<void> => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: { message: string } };
        throw new Error(errorData.error.message ?? 'Registration failed');
      }

      const responseData = (await response.json()) as {
        data: {
          user: AuthUser;
          organization: Organization;
          accessToken: string;
          refreshToken: string;
        };
      };

      // Store tokens
      localStorage.setItem(TOKEN_KEY, responseData.data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, responseData.data.refreshToken);

      // Update state
      setState({
        user: responseData.data.user,
        organization: responseData.data.organization,
        accessToken: responseData.data.accessToken,
        refreshToken: responseData.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    },
    [router]
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call logout endpoint if we have a token
      if (state.accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${state.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setState({
        user: null,
        organization: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Redirect to login
      router.push('/login');
    }
  }, [state.accessToken, router]);

  // Refresh session function
  const refreshSession = useCallback(async (): Promise<void> => {
    const refreshToken = state.refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
      return;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          data: {
            user: AuthUser;
            accessToken: string;
            refreshToken: string;
          };
        };

        // Update tokens
        localStorage.setItem(TOKEN_KEY, data.data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);

        // Update state
        setState((prev) => ({
          ...prev,
          user: data.data.user,
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }));

        // Fetch organization data
        await fetchCurrentUserMemo(data.data.accessToken);
      } else {
        // Refresh failed, clear auth
        await logout();
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      await logout();
    }
  }, [state.refreshToken, logout, fetchCurrentUserMemo]);

  // Set up token refresh interval
  useEffect(() => {
    if (!state.isAuthenticated || !state.accessToken) return;

    // Refresh token every 6 days (before 7-day expiry)
    const interval = setInterval(
      () => {
        void refreshSession();
      },
      6 * 24 * 60 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.accessToken, refreshSession]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Convenience hooks
export function useUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

export function useOrganization(): Organization | null {
  const { organization } = useAuth();
  return organization;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
