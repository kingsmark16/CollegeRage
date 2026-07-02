import { create } from 'zustand';
import type { AuthUser } from '../auth.types';

type AuthSessionStatus = 'loading' | 'ready';

type AuthSessionState = {
  user: AuthUser | null;
  apiUser: AuthUser | null;
  error: string | null;
  redirectPath: string | null;
  status: AuthSessionStatus;
  setUser: (user: AuthUser | null) => void;
  setApiUser: (user: AuthUser | null) => void;
  setError: (error: string | null) => void;
  setRedirectPath: (path: string | null) => void;
  setStatus: (status: AuthSessionStatus) => void;
  resetSession: () => void;
};

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  user: null,
  apiUser: null,
  error: null,
  redirectPath: null,
  status: 'loading',
  setUser: (user) => set({ user }),
  setApiUser: (apiUser) => set({ apiUser }),
  setError: (error) => set({ error }),
  setRedirectPath: (redirectPath) => set({ redirectPath }),
  setStatus: (status) => set({ status }),
  resetSession: () =>
    set({
      user: null,
      apiUser: null,
      error: null,
      redirectPath: null,
      status: 'ready',
    }),
}));
