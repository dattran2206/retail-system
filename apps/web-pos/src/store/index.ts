import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TenantContext } from '@retail-saas/types';

// ================================================
// Zustand Store - Global State Management
// ================================================

// ---- Auth Store ----
interface AuthState {
  user: Omit<User, 'passwordHash'> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: Omit<User, 'passwordHash'>, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ---- Tenant Store ----
interface TenantState {
  tenant: TenantContext | null;
  setTenant: (tenant: TenantContext) => void;
  clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  clearTenant: () => set({ tenant: null }),
}));

// ---- UI Store ----
interface UIState {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-store' },
  ),
);
