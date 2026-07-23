import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../hooks/useApi';

export type UserRole = 'user' | 'doctor' | 'admin';
export type ThemeMode = 'dark' | 'light' | 'cyber' | 'aurora' | 'medical';

export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  role: UserRole;
  level: string;
  xp: number;
  streak_days?: number;
  joinedDate: string;
  avatarUrl?: string;
  is_verified?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  theme: ThemeMode;
  isLoading: boolean;
  setTheme: (theme: ThemeMode) => void;
  login: (user: UserProfile, accessToken?: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
  onboardingDone: boolean;
  setOnboardingDone: (val: boolean) => void;
  addNotification: (message: string, type?: 'info' | 'success' | 'warning') => void;
  notifications: Array<{ id: string; message: string; type: string; time: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const THEME_CLASSES: Record<ThemeMode, string> = {
  dark:    'theme-dark',
  light:   'theme-light',
  cyber:   'theme-cyber',
  aurora:  'theme-aurora',
  medical: 'theme-medical',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aegis_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('aegis_token')
  );

  const [theme, setThemeState] = useState<ThemeMode>(() =>
    (localStorage.getItem('aegis_theme_mode') as ThemeMode) || 'dark'
  );

  const [onboardingDone, setOnboardingDone] = useState<boolean>(() =>
    localStorage.getItem('aegis_onboarding_done') === 'true'
  );

  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: string; time: string }>>([
    { id: '1', message: 'Welcome to Aegis Heart. Complete your health profile to get started.', type: 'info', time: 'Just Now' },
  ]);

  // ── Apply theme class to <html> ───────────────────────────────────
  useEffect(() => {
    const html = document.documentElement;
    Object.values(THEME_CLASSES).forEach(cls => html.classList.remove(cls));
    html.classList.add(THEME_CLASSES[theme]);
    if (theme === 'dark' || theme === 'cyber' || theme === 'aurora') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);

  // ── Map API user response to UserProfile ──────────────────────────
  const mapApiUser = (data: any): UserProfile => ({
    id: data.id,
    name: data.profile?.full_name || data.full_name || data.email?.split('@')[0] || 'User',
    email: data.email,
    role: data.role as UserRole,
    level: data.profile?.level || data.level || 'Beginner',
    xp: data.profile?.xp || data.xp || 0,
    streak_days: data.profile?.streak_days || data.streak_days || 0,
    joinedDate: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    avatarUrl: data.profile?.avatar_url || data.avatar_url,
    is_verified: data.is_verified,
  });

  // ── Refresh user from backend ─────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/api/auth/me');
    if (data) {
      const mapped = mapApiUser(data);
      setUser(mapped);
      localStorage.setItem('aegis_user_profile', JSON.stringify(mapped));
    }
  }, []);

  // ── Validate token on app load ────────────────────────────────────
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('aegis_token');
      if (!savedToken) { setIsLoading(false); return; }

      try {
        const { data, status } = await api.get('/api/auth/me');
        if (data) {
          const mapped = mapApiUser(data);
          setUser(mapped);
          setToken(savedToken);
          localStorage.setItem('aegis_user_profile', JSON.stringify(mapped));
        } else if (status === 401) {
          // Token expired — try refresh (handled by useApi automatically)
          // If we get here it means refresh also failed
          api.clearTokens();
          localStorage.removeItem('aegis_user_profile');
          setUser(null);
          setToken(null);
        }
        // status === 0 (network error) — stay logged in with cached profile
      } catch {
        // Backend offline — use cached profile
      } finally {
        setIsLoading(false);
      }
    };
    validateToken();
  }, []);

  // ── Listen for logout event from api.ts (refresh failure) ────────
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('aegis_user_profile');
    };
    window.addEventListener('aegis:logout', handleForceLogout);
    return () => window.removeEventListener('aegis:logout', handleForceLogout);
  }, []);

  // ── Poll for notifications every 60s ──────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const { data } = await api.get<{ items: any[]; unread_count: number }>('/api/notifications');
      if (data?.items?.length) {
        const mapped = data.items.slice(0, 10).map((n: any) => ({
          id: String(n.id),
          message: n.message,
          type: n.type,
          time: new Date(n.created_at).toLocaleTimeString(),
        }));
        setNotifications(mapped);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('aegis_theme_mode', mode);
    // Persist to backend settings
    if (user) {
      api.put('/api/user/settings', { theme: mode }).catch(() => {});
    }
  };

  const login = (userData: UserProfile, accessToken?: string, refreshToken?: string) => {
    setUser(userData);
    localStorage.setItem('aegis_user_profile', JSON.stringify(userData));
    if (accessToken && refreshToken) {
      api.setTokens(accessToken, refreshToken);
      setToken(accessToken);
    } else if (accessToken) {
      localStorage.setItem('aegis_token', accessToken);
      setToken(accessToken);
    }
  };

  const logout = async () => {
    const refresh = api.getRefreshToken();
    if (refresh) {
      await api.post('/api/auth/logout', { refresh_token: refresh }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    api.clearTokens();
    localStorage.removeItem('aegis_user_profile');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('aegis_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif = {
      id: Math.random().toString(36).substring(7),
      message,
      type,
      time: 'Just now',
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        theme,
        isLoading,
        setTheme,
        login,
        logout,
        updateUser,
        refreshUser,
        onboardingDone,
        setOnboardingDone: (val) => {
          setOnboardingDone(val);
          localStorage.setItem('aegis_onboarding_done', val ? 'true' : 'false');
        },
        addNotification,
        notifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
