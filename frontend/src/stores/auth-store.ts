import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/api';

export type AuthUser = User;

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setSession: (payload: { user: User; accessToken: string }) => void;
  setAccessToken: (accessToken: string | null) => void;
  setUser: (user: User | null) => void;
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
