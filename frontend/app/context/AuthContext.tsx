import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { userService } from '~/services/userService';
import { passkeyService } from '~/services/passkeyService';
import type { LoginRequest, CreateUserRequest } from '~/types/user';
import type { PasskeyDTO } from '~/types/passkey';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: CreateUserRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Passkey methods
  loginWithPasskey: () => Promise<void>;
  registerPasskey: (name: string) => Promise<void>;
  listUserPasskeys: () => Promise<PasskeyDTO[]>;
  deleteUserPasskey: (id: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedUser = localStorage.getItem('currentUser');
  return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionCheckInFlight, setSessionCheckInFlight] = useState(false);

  // Set to true right before setUser() in login/loginWithPasskey so the session
  // validation effect skips the redundant check (the login itself proves validity).
  const justLoggedInRef = useRef(false);

  useEffect(() => {
    const storedUser = loadStoredUser();
    setUser(storedUser);
    setAuthLoading(false);
  }, []);

  const clearAuthState = useCallback(() => {
    // Clear authentication data from localStorage
    // Note: customTags is intentionally kept — it stores UI preferences
    // (tag names/colors) that should persist across logout/login for the same device.
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    setUser(null);
    setSessionCheckInFlight(false);
  }, []);

  // Validate session on mount if user exists in localStorage
  useEffect(() => {
    if (!user) {
      return;
    }

    let isActive = true;

    const validateSession = async () => {
      // Skip validation right after a fresh login — the login itself proves the session is valid.
      // This prevents a race where the validation unmounts home.tsx via ProtectedRoute loading state.
      if (justLoggedInRef.current) {
        justLoggedInRef.current = false;
        return;
      }
      setSessionCheckInFlight(true);
      try {
        console.log('[AuthContext] Validating session...');
        await userService.getCurrentUserFromBackend();
        console.log('[AuthContext] Session validated successfully.');
      } catch (err) {
        // Session validation failed
        // Note: If access token expired, useTokenRefresh hook will handle it via auto-refresh
        // We only clear auth if we get a real error (not just expired token)
        console.error('[AuthContext] Session validation error:', err);
        // If it's a 401, the apiClient's auto-refresh or useTokenRefresh will handle it
        // So we don't clear auth state immediately - let the refresh mechanism work
      } finally {
        if (isActive) {
          setSessionCheckInFlight(false);
        }
      }
    };

    validateSession();

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  const login = useCallback(async (request: LoginRequest) => {
    setAuthLoading(true);
    try {
      const response = await userService.login(request);
      const nextUser: AuthUser = {
        id: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName ?? '',
        lastName: response.lastName ?? '',
        avatarUrl: (response as unknown as Record<string, unknown>).avatarUrl as string | undefined,
      };
      justLoggedInRef.current = true;
      setUser(nextUser);
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const register = useCallback(async (request: CreateUserRequest) => {
    setAuthLoading(true);
    try {
      await userService.register(request);
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      throw error; // Re-throw so calling component can display the error
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await userService.logout();
    } finally {
      clearAuthState();
      setAuthLoading(false);
    }
  }, [clearAuthState]);

  // ============================================
  // Passkey Methods
  // ============================================

  const loginWithPasskey = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await passkeyService.authenticateWithPasskey();

      const nextUser: AuthUser = {
        id: response.userId,
        username: response.username,
        email: response.email,
        firstName: response.firstName ?? '',
        lastName: response.lastName ?? '',
        avatarUrl: (response as unknown as Record<string, unknown>).avatarUrl as string | undefined,
      };

      // Store user in localStorage for persistence across page refreshes
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      
      justLoggedInRef.current = true;
      setUser(nextUser);
    } catch (error) {
      console.error('[AuthContext] Passkey login failed:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await userService.getCurrentUserFromBackend();
      const nextUser: AuthUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        avatarUrl: userData.avatarUrl,
      };
      localStorage.setItem('currentUser', JSON.stringify(nextUser));
      setUser(nextUser);
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
    }
  }, []);

  const registerPasskey = useCallback(async (name: string) => {
    try {
      await passkeyService.registerPasskey(name);
    } catch (error) {
      console.error('[AuthContext] Passkey registration failed:', error);
      throw error;
    }
  }, []);

  const listUserPasskeys = useCallback(async (): Promise<PasskeyDTO[]> => {
    try {
      return await passkeyService.listPasskeys();
    } catch (error) {
      console.error('[AuthContext] Failed to list passkeys:', error);
      throw error;
    }
  }, []);

  const deleteUserPasskey = useCallback(async (id: number) => {
    try {
      await passkeyService.deletePasskey(id);
    } catch (error) {
      console.error('[AuthContext] Failed to delete passkey:', error);
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authLoading: authLoading || sessionCheckInFlight,
      login,
      register,
      logout,
      refreshUser,
      loginWithPasskey,
      registerPasskey,
      listUserPasskeys,
      deleteUserPasskey,
    }),
    [user, authLoading, sessionCheckInFlight, login, register, logout, refreshUser, loginWithPasskey, registerPasskey, listUserPasskeys, deleteUserPasskey]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}