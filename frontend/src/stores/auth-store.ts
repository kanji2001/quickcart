import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: {
    url?: string;
  } | null;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setSession: (payload: { user: AuthUser; accessToken: string }) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (value: boolean) => void;
  clearSession: () => void;
};

type AuthPersist = Pick<AuthState, 'user' | 'accessToken'>;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      setSession: ({ user, accessToken }) => {
        set({ user, accessToken });
      },
      setAccessToken: (accessToken) => {
        set((state) => ({ ...state, accessToken }));
      },
      setUser: (user) => {
        set((state) => ({ ...state, user }));
      },
      setLoading: (value) => {
        set((state) => ({ ...state, isLoading: value }));
      },
      clearSession: () => {
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken } satisfies AuthPersist),
    },
  ),
);

export const selectAuthUser = (state: AuthState) => state.user;
export const selectAccessToken = (state: AuthState) => state.accessToken;
export const selectIsAuthenticated = (state: AuthState) => Boolean(state.user && state.accessToken);
export const selectAuthLoading = (state: AuthState) => state.isLoading;
